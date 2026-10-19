// TerRa 1.6.0 — (1) „← înapoi” nu e acoperit de widgetul Buy Me a Coffee; (2) avertisment de precizie pentru date > 2100.
// Rulare: node tests/terra-extras.test.mjs
import {launch, check, summary} from "./_lib.mjs";
for (const vp of [{w: 1280, h: 800}, {w: 390, h: 740}]) {
  const {browser, page, st} = await launch({w: vp.w, h: vp.h});
  const go = async h => { await page.goto(page.url().split("#")[0] + h); await page.reload(); await page.waitForTimeout(2000); };
  await go("#v=sky&from=bolta");
  const r = await page.evaluate(() => { const b = document.getElementById("fff-back").getBoundingClientRect(), d = document.querySelector("#tf-donate a").getBoundingClientRect();
    return {back: [b.left, b.top, b.right, b.bottom], bmc: [d.left, d.top, d.right, d.bottom], overlap: !(b.right <= d.left || b.left >= d.right || b.bottom <= d.top || b.top >= d.bottom)}; });
  check(`${vp.w}px: „← înapoi” și Buy Me a Coffee nu se suprapun`, r.overlap === false, r);
  await page.evaluate(() => { window.__bc = 0; document.getElementById("fff-back").addEventListener("click", e => { window.__bc++; e.preventDefault(); }); document.querySelector("#tf-donate a").addEventListener("click", e => { window.__dc = (window.__dc || 0) + 1; e.preventDefault(); }); });
  await page.click("#fff-back", {timeout: 4000});
  check(`${vp.w}px: page.click pe „← înapoi” ajunge la buton (nu la widget)`, (await page.evaluate(() => window.__bc)) === 1 && !(await page.evaluate(() => window.__dc)));
  await page.click("#tf-donate a", {timeout: 4000});
  check(`${vp.w}px: widgetul BMC rămâne apăsabil`, (await page.evaluate(() => window.__dc)) === 1);
  await browser.close();
}
const {browser, page, st} = await launch();
const go = async h => { await page.goto(page.url().split("#")[0] + h); await page.reload(); await page.waitForTimeout(1800); };
const vis = () => page.evaluate(() => { const e = document.getElementById("prec-warn"); return {hidden: e.hidden, shown: e.offsetParent !== null, txt: e.textContent}; });
await go("#v=sky&t=2026-10-18T15:00:00Z");
let v = await vis(); check("2026: avertisment ascuns", v.hidden === true && !v.shown, v);
await go("#v=sky&t=2100-12-31T23:00:00Z");
v = await vis(); check("2100-12-31: ascuns (nu depășește 2100)", v.hidden === true, v);
await go("#v=sky&t=2101-01-01T00:00:00Z");
v = await vis(); check("2101: vizibil, text RO", v.hidden === false && v.shown && /Precizie scăzută după 2100: ΔT extrapolat, Pluto indisponibil/.test(v.txt), v);
await go("#v=2d&t=2150-06-01T00:00:00Z");
v = await vis(); check("2150 în 2D: vizibil", v.hidden === false && v.shown, v);
await page.evaluate(() => document.getElementById("lang-btn").click()); await page.waitForTimeout(300);
v = await vis(); check("EN: text tradus", /Reduced accuracy after 2100: ΔT extrapolated, Pluto unavailable/.test(v.txt), v);
await page.evaluate(() => document.getElementById("lang-btn").click()); await page.waitForTimeout(200);
await page.evaluate(() => document.getElementById("lang-btn").click()); await page.waitForTimeout(300);
v = await vis(); check("HU/DE: folosește textul EN (ca restul aplicației)", /Reduced accuracy/.test(v.txt), v);
await page.evaluate(() => document.getElementById("btn-now").click()); await page.waitForTimeout(500);
v = await vis(); check("„Revino la acum”: avertismentul dispare", v.hidden === true, v);
check("0 erori", st.errs.length === 0, st.errs);
check("0 rețea", st.net.length === 0, st.net);
check("0 violări CSP", (await page.evaluate(() => window.__csp)).length === 0);
await browser.close();
summary();
