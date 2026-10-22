// TerRa — teste pentru funcțiile noi (runda 8): efemeride locale (răsărit/apus, faze, poziții) față de referințe independente.
// Rulare: node tests/fff-r8.test.mjs   (Playwright din /opt/node-tools, rețea blocată, Chromium local)
import {launch, axeRun, hOverflow, check, summary, REF} from "./_lib.mjs";

const NOON = "2026-10-14T09:00:00Z";
const hhmm = (iso, zone) => new Intl.DateTimeFormat("en-GB", {hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: zone}).format(new Date(iso));
const toMin = s => { const m = /(\d\d):(\d\d)/.exec(s); return m ? +m[1] * 60 + +m[2] : null; };
const dmin = (a, b) => { const d = Math.abs(a - b); return Math.min(d, 1440 - d); };
const ensurePanel = async page => { if (!(await page.isVisible("#btn-eph"))) await page.click("#panelToggle"); };
const setLocPanel = async (page, lat, lon) => { await ensurePanel(page); await page.fill("#loc-lat", String(lat)); await page.fill("#loc-lon", String(lon)); await page.click("#btn-setloc"); await page.waitForTimeout(200); };
const openDlg = async page => { await ensurePanel(page); await page.click("#btn-eph"); await page.waitForSelector("#ephDialog[open]"); await page.waitForTimeout(150); };
const closeDlg = async page => { await page.keyboard.press("Escape"); await page.waitForTimeout(150); };

console.log("1. pornire, versiune, 0 erori");
{
  const {browser, page, st} = await launch({clock: NOON, timezoneId: "Europe/Bucharest"});
  await page.waitForTimeout(3500);
  check("0 pageerror/console error", st.errs.length === 0, st.errs);
  check("0 cereri de rețea", st.net.length === 0, st.net);
  check("0 violări CSP", (await page.evaluate(() => window.__csp)).length === 0);
  check("#app-version arată 1.7.4 · 2026-10-22", /1\.7\.4 · 2026-10-22/.test((await page.textContent("#app-version")).replace(/\s+/g, " ")));
  check("meta application-version 1.7.4", (await page.getAttribute('meta[name="application-version"]', "content")) === "1.7.4");
  check("meta last-updated 2026-10-22", (await page.getAttribute('meta[name="last-updated"]', "content")) === "2026-10-22");
  check("linia-rezumat de efemeride pentru București (răsărit, apus, Lună)", /București: Răsărit Soare \d\d:\d\d, apus \d\d:\d\d/.test(await page.textContent("#eph-sum")), await page.textContent("#eph-sum"));
  check("fără depășire orizontală 1280", (await hOverflow(page)) <= 0);
  await browser.close();
}

console.log("2. răsărit/apus din fereastră față de pyephem (5 locuri, 14.10.2026, ±1 min după rotunjire)");
{
  const {browser, page, st} = await launch({clock: NOON, timezoneId: "Europe/Bucharest"});
  await page.waitForTimeout(2500);
  let n = 0; const bad = [];
  for (const r of REF.riseSet.filter(x => x.date === "2026-10-14")) {
    await setLocPanel(page, r.lat, r.lon); await openDlg(page);
    await page.fill("#eph-tz", r.zone); await page.dispatchEvent("#eph-tz", "change"); await page.waitForTimeout(200);
    const ui = {sun: [await page.textContent("#eph-sunrise"), await page.textContent("#eph-sunset")], moon: [await page.textContent("#eph-moonrise"), await page.textContent("#eph-moonset")]};
    for (const b of ["sun", "moon"]) [["rise", 0], ["set", 1]].forEach(([k, i]) => { const iso = r[b][k]; if (!iso) return; n++; const got = toMin(ui[b][i]); if (got == null || dmin(got, toMin(hhmm(iso, r.zone))) > 1) bad.push([r.site, b, k, ui[b][i], hhmm(iso, r.zone)]); });
    await closeDlg(page);
  }
  check(`${n} momente (Soare + Lună) afișate coincid cu pyephem ±1 min`, n >= 18 && bad.length === 0, bad.slice(0, 6));
  check("0 erori", st.errs.length === 0, st.errs);
  await browser.close();
}

console.log("3. calcul numeric (EPH.compute) față de pyephem: răsărit/apus în secunde, faze, alt/az");
{
  const {browser, page} = await launch({clock: NOON, timezoneId: "Europe/Bucharest"});
  await page.waitForTimeout(1500);
  const R = await page.evaluate(ref => {
    const E = FFF.ephem, out = {rs: [], ph: [], hz: []};
    for (const w of ref.riseSet) {
      const d = EPH.compute({lat: w.lat, lon: w.lon, zone: w.zone, date: new Date(w.noonUtc)});
      for (const body of ["sun", "moon"]) { const rst = d.bodies.find(x => x.name === body).rst; for (const k of ["rise", "set", "transit"]) { const q = w[body][k], v = rst[k]; out.rs.push({body, d: (q && v != null) ? (E.dateFromJd(v).getTime() - Date.parse(q)) / 1000 : ((q == null && v == null) ? 0 : 1e9)}); } }
    }
    for (const q of ref.phases) { const t = Date.parse(q.utc); const jd = E.nextPhase(E.jdFromDate(new Date(t - 3 * 864e5)), q.kind, 1); out.ph.push({d: (E.dateFromJd(jd).getTime() - t) / 1000}); }
    for (const o of ref.horizontal) { if (o.alt < 3) continue; const ob = E.observe(o.body, E.jdFromDate(new Date(o.utc)), o.lat, o.lon, 0, {refraction: true}); let da = ob.az - o.az; da = ((da + 540) % 360) - 180; out.hz.push({dalt: ob.alt - o.alt, daz: da * Math.cos(o.alt * Math.PI / 180)}); }
    return out;
  }, REF);
  const mx = a => Math.max(...a.map(Math.abs));
  const s = R.rs.filter(x => x.body === "sun").map(x => x.d), m = R.rs.filter(x => x.body === "moon").map(x => x.d);
  check("Soare: răsărit/apus/trecere în ±5 s (60 valori)", s.length === 60 && mx(s) <= 5, [s.length, mx(s)]);
  check("Lună: răsărit/apus/trecere în ±10 s (60 valori)", m.length === 60 && mx(m) <= 10, [m.length, mx(m)]);
  check("faze: 56 de momente în ±30 s", R.ph.length === 56 && mx(R.ph.map(x => x.d)) <= 30, mx(R.ph.map(x => x.d)));
  check("alt/az (6 corpuri) în ±0,02°", R.hz.length >= 20 && mx(R.hz.map(x => x.dalt)) <= 0.02 && mx(R.hz.map(x => x.daz)) <= 0.02, [R.hz.length, mx(R.hz.map(x => x.dalt)), mx(R.hz.map(x => x.daz))]);
  await browser.close();
}

console.log("4. faze ale Lunii și tabelul de poziții din fereastră");
{
  const {browser, page} = await launch({clock: "2026-10-14T18:30:00Z", timezoneId: "Europe/Bucharest"});
  await page.waitForTimeout(2500); await openDlg(page);
  const li = await page.$$eval("#eph-nextphases li", els => els.map(e => [e.dataset.kind, e.textContent]));
  check("4 faze viitoare", li.map(x => x[0]).sort().join() === "first,full,last,new", li);
  const bad = [];
  for (const [kind, txt] of li) {
    const first = REF.phases.filter(p => p.kind === kind).map(p => p.utc).sort().find(u => Date.parse(u) > Date.parse("2026-10-14T18:30:00Z"));
    const ref = new Intl.DateTimeFormat("sv-SE", {year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Europe/Bucharest"}).format(new Date(first));
    const m = /(\d{4}-\d\d-\d\d \d\d:\d\d)$/.exec(txt.trim());
    if (!m || Math.abs(Date.parse(m[1].replace(" ", "T") + "Z") - Date.parse(ref.replace(" ", "T") + "Z")) > 60000) bad.push([kind, m && m[1], ref]);
  }
  check("orele fazelor coincid cu pyephem ±1 min", bad.length === 0, bad);
  const rows = await page.$$eval("#eph-bodies tbody tr", trs => trs.map(t => [t.dataset.body, t.children[2].textContent]));
  check("tabel cu Soare, Lună și planete", rows.length >= 9, rows.length);
  let ok = 0, tot = 0; const det = [];
  for (const o of REF.horizontal.filter(o => o.site === "București" && o.utc === "2026-10-14T18:30:00Z")) { const r = rows.find(x => x[0] === o.body); if (!r) continue; const m = /(-?[\d.,−]+)° \/ (\d+)°/.exec(r[1].replace("−", "-")); if (!m) continue; tot++; const alt = parseFloat(m[1].replace(",", ".")); let da = Math.abs(+m[2] - o.az); da = Math.min(da, 360 - da); if (Math.abs(alt - o.alt) <= 0.06 && da <= 0.6) ok++; else det.push([o.body, r[1], o.alt, o.az]); }
  check("alt/az din tabel coincid cu pyephem (rotunjite)", tot >= 5 && ok === tot, det);
  check("precizia e declarată în fereastră cu limitele reale", await (async () => { const a = await page.textContent("#eph-acc"); return /6 s/.test(a) && /25 s/.test(a) && /30 s/.test(a) && /3″/.test(a) && /refrac/i.test(a); })());
  await browser.close();
}

console.log("5. dialog: focus, Escape, scurtături de tastatură blocate cât timp e deschis");
{
  const {browser, page, st} = await launch({clock: NOON, timezoneId: "Europe/Bucharest"});
  await page.waitForTimeout(2500);
  const mode0 = await page.evaluate(() => state.mode);
  await openDlg(page);
  check("dialogul e modal (showModal) și are titlu", (await page.evaluate(() => document.getElementById("ephDialog").matches(":modal"))) && (await page.textContent("#ephDlgTitle")).length > 3);
  await page.keyboard.press("2"); await page.keyboard.press("3"); await page.keyboard.press("n");
  check("tastele 1/2/3/n nu schimbă aplicația cât timp dialogul e deschis", (await page.evaluate(() => state.mode)) === mode0);
  await closeDlg(page);
  check("Escape închide dialogul", (await page.locator("#ephDialog[open]").count()) === 0);
  check("focusul revine pe buton", (await page.evaluate(() => document.activeElement && document.activeElement.id)) === "btn-eph");
  await page.mouse.click(5, 5);
  await page.keyboard.press("3"); await page.waitForTimeout(200);
  check("fără dialog, scurtătura funcționează în continuare (regresie)", (await page.evaluate(() => state.mode)) === "sky", await page.evaluate(() => state.mode));
  check("0 erori", st.errs.length === 0, st.errs);
  await browser.close();
}

console.log("6. loc și fus orar în fereastră; sincron cu locația aplicației");
{
  const {browser, page} = await launch({clock: NOON, timezoneId: "Europe/Bucharest"});
  await page.waitForTimeout(2500);
  await setLocPanel(page, 35.6762, 139.6503);
  check("linia-rezumat se actualizează cu locul nou", /Răsărit Soare/.test(await page.textContent("#eph-sum")));
  await openDlg(page);
  check("dialogul folosește locul curent al aplicației (Tokyo)", /35[,.]6762°, 139[,.]6503°/.test(await page.textContent("#eph-locline")), await page.textContent("#eph-locline"));
  await page.fill("#eph-tz", "Asia/Tokyo"); await page.dispatchEvent("#eph-tz", "change");
  check("ore în Asia/Tokyo (UTC+09:00)", /Asia\/Tokyo.*\+09:00/.test(await page.textContent("#eph-zoneline")), await page.textContent("#eph-zoneline"));
  await page.fill("#eph-tz", "Nu/Exista"); await page.dispatchEvent("#eph-tz", "change");
  check("fus orar invalid: avertizare", /fus/i.test(await page.textContent("#eph-msg")), await page.textContent("#eph-msg"));
  await page.click("#eph-tzb");
  check("„Fusul browserului” repune un fus valid", /Europe\/Bucharest/.test(await page.inputValue("#eph-tz")), await page.inputValue("#eph-tz"));
  await browser.close();
}

console.log("7. limbi: ro → en → hu → de");
{
  const {browser, page} = await launch({clock: NOON, timezoneId: "Europe/Bucharest"});
  await page.waitForTimeout(2500);
  const seq = [], titles = {}, sums = {};
  for (let i = 0; i < 4; i++) { const l = await page.evaluate(() => document.documentElement.lang); seq.push(l); sums[l] = await page.textContent("#eph-sum"); await openDlg(page); titles[l] = await page.textContent("#ephDlgTitle"); await closeDlg(page); await page.evaluate(() => document.getElementById("lang-btn").click()); await page.waitForTimeout(250); }
  check("ciclul de limbi atinge ro, en, hu, de", ["ro", "en", "hu", "de"].every(l => seq.includes(l)), seq);
  check("titlul dialogului diferă în hu și de față de en", titles.hu !== titles.en && titles.de !== titles.en && titles.hu !== titles.de, titles);
  check("rezumatul e tradus (hu: Napkelte, de: Sonnenaufgang)", /Napkelte/i.test(sums.hu) && /Sonnenaufgang/i.test(sums.de), sums);
  await browser.close();
}

console.log("8. accesibilitate (axe) și fără depășire, 1280×800 și 360×740, cu dialogul deschis, în ro/hu/de, temă deschisă și închisă");
for (const scheme of ["light", "dark"]) for (const [w, h] of [[1280, 800], [360, 740]]) {
  const {browser, page} = await launch({w, h, bypassCSP: true, colorScheme: scheme, clock: NOON, timezoneId: "Europe/Bucharest"});
  await page.waitForTimeout(3500);
  const v0 = (await axeRun(page)) || [];
  check(`${scheme} ${w}: axe 0 (pagina)`, v0.length === 0, v0);
  await openDlg(page);
  const v1 = (await axeRun(page)) || [];
  check(`${scheme} ${w}: axe 0 (dialog deschis)`, v1.length === 0, v1);
  check(`${scheme} ${w}: fără depășire orizontală în dialog`, (await page.evaluate(() => { const d = document.getElementById("ephDialog"); return Math.max(d.scrollWidth - d.clientWidth, document.documentElement.scrollWidth - document.documentElement.clientWidth); })) <= 0);
  if (scheme === "light") for (const l of ["en", "hu", "de"]) { await closeDlg(page); while ((await page.evaluate(() => document.documentElement.lang)) !== l) { await page.evaluate(() => document.getElementById("lang-btn").click()); await page.waitForTimeout(200); } await openDlg(page); const v = (await axeRun(page)) || []; check(`${w}: axe 0 în ${l}`, v.length === 0, v); }
  await browser.close();
}
summary();
