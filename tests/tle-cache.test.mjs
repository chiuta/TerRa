// TerRa 2.2.0 — sursa/vechimea TLE afișate din date reale + copie locală (Cache Storage) pentru offline.
// Rulare: node tests/tle-cache.test.mjs   (Playwright: PW_ROOT=/opt/node-tools/package.json; Chromium: CHROMIUM_PATH=...)
// Pagina e servită de pe http://localhost (context sigur → Cache Storage); CelesTrak este simulat (fără rețea reală).
import http from "node:http";
import fs from "node:fs";
import {chromium, INDEX, check, summary} from "./_lib.mjs";

const html = fs.readFileSync(INDEX);
const server = http.createServer((req, res) => { if (req.url === "/" || req.url.startsWith("/index.html")) { res.writeHead(200, {"Content-Type": "text/html; charset=utf-8"}); res.end(html); } else { res.writeHead(404); res.end(); } });
await new Promise(r => server.listen(0, "127.0.0.1", r));
const URL0 = "http://localhost:" + server.address().port + "/";
const ISS = ["ISS (ZARYA)", "1 25544U 98067A   26300.50000000  .00005693  00000+0  10963-3 0  9990", "2 25544  51.6320 243.2491 0004267 243.5322 116.5229 15.49468267573535"];
// suma de control a liniilor TLE nu e verificată de aplicație (parseTLE); folosim un TLE bine formatat
const FAKE = ISS.join("\n") + "\n";

const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || undefined});
const ctx = await browser.newContext({viewport: {width: 1280, height: 800}, locale: "ro-RO"});
let celes = 0, other = [];
await ctx.route(/^https?:\/\/(?!localhost)/, r => { const u = r.request().url(); if (/celestrak\.org/.test(u)) { celes++; r.fulfill({status: 200, contentType: "text/plain", body: FAKE}); } else { other.push(u); r.abort(); } });
const page = await ctx.newPage();
const errs = []; page.on("pageerror", e => errs.push(String(e)));
await page.goto(URL0); await page.waitForSelector("#src-detail", {state: "attached"});
await page.waitForTimeout(1500);
const openPanel = async () => { if (!(await page.isVisible("#src-detail"))) await page.click("#panelToggle"); await page.waitForTimeout(300); };
await openPanel();

// regresie: epoca TLE → JD era cu 1–2 zile prea mică (jdJan1); referința vine din `sgp4` (Python) pentru TLE-ul ISS de mai jos
const sg = await page.evaluate(() => { const l1 = "1 25544U 98067A   26179.67039743  .00005693  00000+0  10963-3 0  9998", l2 = "2 25544  51.6320 243.2491 0004267 243.5322 116.5229 15.49468267573535"; const rec = SGP4.parseTLE("ISS", l1, l2); const out = {jd: rec.jdsatepoch}; for (const dm of [0, 60]) out["p" + dm] = SGP4.propagate(rec, dm)[0]; return out; });
check("SGP4: JD al epocii TLE = 2461220.17039743 (referință Python sgp4)", Math.abs(sg.jd - 2461220.17039743) < 1e-6, sg.jd);
check("SGP4: poziția ISS la epocă (TEME, km) = referință sgp4 la < 1 km", Math.hypot(sg.p0[0] + 3060.1, sg.p0[1] + 6070.8, sg.p0[2] - 0) < 1, sg.p0);
check("SGP4: poziția ISS la +60 min = referință sgp4 la < 1 km", Math.hypot(sg.p60[0] + 1124.3, sg.p60[1] - 5195.0, sg.p60[2] + 4237.5) < 1, sg.p60);
const d0 = await page.textContent("#src-detail");
check("snapshot: sursa CelesTrak și intervalul de epoci afișate", /CelesTrak/.test(d0) && /2026-06-06/.test(d0) && /2026-07-01/.test(d0) && /2026-06-28/.test(d0), d0);
check("snapshot: vechimea în zile este un număr", /~\d+ zile/.test(d0), d0);
check("rândul cu copia locală este ascuns la început", (await page.$eval("#cache-row", e => getComputedStyle(e).display)) === "none");

// descărcare simulată
await page.selectOption("#grp", "stations");
await page.click("#btn-update"); await page.waitForTimeout(1500);
const s1 = await page.textContent("#src-status"), d1 = await page.textContent("#src-detail");
check("actualizare online (simulată): stare OK și copia salvată", /✓/.test(s1) && /copie salvată/.test(s1), s1);
check("după descărcare: detaliul arată CelesTrak, grupul și ora", /CelesTrak/.test(d1) && /stations/.test(d1) && /UTC/.test(d1), d1);
check("o singură cerere către CelesTrak, nicio altă gazdă", celes === 1 && other.length === 0, [celes, other]);
check("rândul cu copia locală devine vizibil", (await page.$eval("#cache-row", e => getComputedStyle(e).display)) === "flex");

// revenire la snapshot, apoi încărcare din copie (fără rețea: blocăm CelesTrak)
await page.click("#btn-embed"); await page.waitForTimeout(500);
check("revenire la snapshot", /snapshot/i.test(await page.textContent("#src-info")) || /2026-06-06/.test(await page.textContent("#src-detail")));
await ctx.route(/celestrak\.org/, r => r.abort());
await page.click("#btn-cache"); await page.waitForTimeout(800);
const d2 = await page.textContent("#src-detail"), i2 = await page.textContent("#src-info");
check("încărcare din copia locală: detaliul spune că e copie păstrată în browser", /Copie păstrată în acest browser/.test(d2) && /stations/.test(d2), d2);
check("încărcare din copia locală: 1 satelit (cel simulat)", /^1 /.test(i2.trim()), i2);
check("copia supraviețuiește reîncărcării paginii", await (async () => { await page.reload(); await page.waitForSelector("#cache-row", {state: "attached"}); await page.waitForTimeout(800); return (await page.$eval("#cache-row", e => getComputedStyle(e).display)) === "flex"; })());

// engleză
await page.selectOption("#lang-sel", "en"); await page.waitForTimeout(500);
const den = await page.textContent("#src-detail");
check("EN: textul sursei este tradus", /Source: the TLE elements come from CelesTrak/.test(den) && !/zile/.test(den), den);
check("EN: butoanele sunt traduse", /Last downloaded data/.test(await page.textContent("#btn-cache")) && /Delete the local copy/.test(await page.textContent("#btn-cache-del")));
for (const l of ["fr", "it", "es", "pt", "de", "hu"]) { await page.selectOption("#lang-sel", l); await page.waitForTimeout(250); const dd = await page.textContent("#src-detail"); check(l + ": detaliul sursei tradus (fără {…} rămase, fără română)", !/[{}]/.test(dd) && !/Sursa:|zile vechime|epocă/.test(dd), dd); }
await page.selectOption("#lang-sel", "ro");

// ștergere
await page.click("#btn-cache-del"); await page.waitForTimeout(500);
check("ștergere: rândul se ascunde", (await page.$eval("#cache-row", e => getComputedStyle(e).display)) === "none");
check("ștergere: cache-ul dispare din Cache Storage", !(await page.evaluate(async () => (await caches.keys()).includes("terra-tle-v1"))));
check("fără erori JS", errs.length === 0, errs);
await browser.close(); server.close(); summary();
