// TerRa — teste pentru legătura cu ORARIUM (1.3.0): panou „Ora pe alte lumi”, banner de observator, linkuri unice, link combinat.
// Rulare: node tests/orarium-bridge.test.mjs   (Playwright din /opt/node-tools, rețea blocată)
import {launch, check, summary} from "./_lib.mjs";
const T = "2026-10-18T15:00:00Z";
{
  const {browser, page, st} = await launch({perm: ["clipboard-read", "clipboard-write"], timezoneId: "Europe/Bucharest"});
  await page.goto(page.url().split("#")[0] + `#v=sky&o=mars&t=${T}&ll=44.43,26.1`);
  await page.reload(); await page.waitForTimeout(2500);
  check("0 pageerror/console error", st.errs.length === 0, st.errs);
  check("0 cereri de rețea", st.net.length === 0, st.net);
  check("0 violări CSP", (await page.evaluate(() => window.__csp)).length === 0);
  check("panoul listează toate cele 45 de corpuri din ORARIUM", (await page.evaluate(() => document.getElementById("orb-list").children.length)) === 45);
  // toate corpurile ORARIUM sunt observatoare în TerRa și au legătură în ambele sensuri
  const NEW = ["phobos","deimos","hyperion","charon","ceres","vesta","pallas","haumea","makemake","eris","bennu","ryugu","eros","hygiea","psyche"];
  const all = await page.evaluate(n => n.map(k => ({k, opt: !![...document.querySelectorAll("#skyobs option")].find(o => o.value === k), id: ORB.id(k), v: bodyHelioEcl(k, 2461331.5)})), NEW);
  check("15 corpuri noi: observator + id ORARIUM + poziție finită", all.every(x => x.opt && x.id === x.k && x.v.every(Number.isFinite)), all.filter(x => !(x.opt && x.id === x.k)));
  const R = k => Math.hypot(...all.find(x => x.k === k).v);
  check("Ceres ≈ 2,66 UA de Soare (JPL Horizons 2026-10-18)", Math.abs(R("ceres") - 2.6598) < 0.01, R("ceres"));
  check("Eros ≈ 1,711 UA de Soare (JPL Horizons)", Math.abs(R("eros") - 1.7129) < 0.01, R("eros"));
  check("Eris ≈ 95,45 UA de Soare (JPL Horizons)", Math.abs(R("eris") - 95.45) < 0.1, R("eris"));
  check("Bennu ajustat pe efemerida JPL (≈1,349 UA)", Math.abs(R("bennu") - 1.3492) < 0.01, R("bennu"));
  const rows = await page.evaluate(() => [...document.querySelectorAll("#orb-list .orb-row")].map(r => [...r.querySelectorAll("a")].map(a => a.href)));
  check("fiecare rând: ↗ ORARIUM și 👁 cerul din TerRa", rows.every(r => r.some(u => u.startsWith("https://chiuta.github.io/orarium/#body=")) && r.some(u => /#v=sky&o=/.test(u))), rows.filter(r => !(r.some(u => u.startsWith("https://chiuta.github.io/orarium/#body=")) && r.some(u => /#v=sky&o=/.test(u)))));
  await page.goto(page.url().split("#")[0] + `#v=sky&o=ceres&t=${T}`); await page.reload(); await page.waitForTimeout(2000);
  check("link unic #o=ceres deschide cerul de pe Ceres", (await page.evaluate(() => state.skyObs === "ceres" && state.mode === "sky")));
  check("banner ORARIUM pentru Ceres", (await page.evaluate(() => [...document.querySelectorAll("#orb-obs a")].some(a => a.href.includes("body=ceres")))));
  await page.goto(page.url().split("#")[0] + `#v=sky&o=mars&t=${T}&ll=44.43,26.1`); await page.reload(); await page.waitForTimeout(2000);
  // valori de referință = motorul ORARIUM la 2026-10-18T15:00Z
  const h = await page.evaluate(t => { const ms = Date.parse(t); return {mars: ORB.hour("mars", ms, 0), luna: ORB.hour("luna", ms, 0), jup: ORB.hour("jupiter", ms, 0)}; }, T);
  check("ora pe Marte 20:37 (ORARIUM)", Math.abs(h.mars - (20 + 37 / 60)) < 0.02, h);
  check("ora pe Lună coerentă", h.luna >= 0 && h.luna < 24);
  const obs = await page.evaluate(() => ({hid: document.getElementById("orb-obs").hidden, hrefs: [...document.querySelectorAll("#orb-obs a")].map(a => a.href)}));
  check("bannerul de observator apare pentru Marte", obs.hid === false);
  check("link fișă ORARIUM cu corp și moment", obs.hrefs.some(u => u === `https://chiuta.github.io/orarium/#body=marte&t=${T}`), obs.hrefs);
  check("link transmisie cu stația din Locația mea", obs.hrefs.some(u => u.includes("view=link") && u.includes("b=marte") && u.includes("station=44.4300,26.1000")), obs.hrefs);
  await page.click("#lnk2-btn"); await page.waitForTimeout(200);
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  check("link combinat: TerRa + ORARIUM", /TerRa: .*#v=sky&o=mars/.test(clip) && /ORARIUM: https:\/\/chiuta\.github\.io\/orarium\/#view=link/.test(clip), clip);
  await browser.close();
}
summary();
