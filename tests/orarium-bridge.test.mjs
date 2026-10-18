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
  check("panoul listează 9 corpuri", (await page.evaluate(() => document.getElementById("orb-list").children.length)) === 9);
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
