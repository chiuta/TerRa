// TerRa 1.6.0 — buton „↗ Bolta” (cer de la sol). Copiat în TerRa/tests/bolta-bridge.test.mjs
// Rulare: node tests/bolta-bridge.test.mjs
import {launch, check, summary} from "./_lib.mjs";
const T = "2026-10-18T15:00:00Z";
const {browser, page, st} = await launch({timezoneId: "Europe/Bucharest"});
const vis = () => page.evaluate(() => { const e = document.getElementById("bolta-lnk"); return {hidden: e.hidden, hrefs: [...e.querySelectorAll("a")].map(a => a.href), txt: e.textContent, rel: [...e.querySelectorAll("a")].map(a => a.rel + "|" + a.target)}; });
const go = async h => { await page.goto(page.url().split("#")[0] + h); await page.reload(); await page.waitForTimeout(2200); };
// 1) cer de la sol + Locația mea + moment fix -> link cu t, ll rotunjit la 2 zecimale, from=terra
await go(`#v=sky&t=${T}&ll=44.4268,26.1025`);
let v = await vis();
check("modul Cer de la sol cu locație: link vizibil", v.hidden === false && v.hrefs.length === 1, v);
check("href exact (#sky&t=…&ll=2 zecimale&from=terra)", v.hrefs[0] === `https://chiuta.github.io/apps/Bolta/#sky&t=${T}&ll=44.43,26.10&from=terra`, v.hrefs);
check("target=_blank rel=noopener", v.rel[0] === "_blank|noopener" || /noopener/.test(v.rel[0]) && /_blank/.test(v.rel[0]), v.rel);
check("t fără milisecunde (Bolta acceptă și .000Z, dar TerRa nu — consecvență)", !/\.\d{3}Z/.test(v.hrefs[0]));
// 2) fără locație -> ascuns
await go(`#v=sky&t=${T}`);
check("implicit TerRa are București ca Locație (eticheta e afișată)", await page.evaluate(() => state.loc && state.loc.label === "București"));
await page.click("#btn-clearloc"); await page.evaluate(() => ORB.refresh());
check("după „șterge locația”: link ascuns", (await vis()).hidden === true);
// 3) alt observator (Marte) -> ascuns; 2D -> ascuns
await go(`#v=sky&o=mars&t=${T}&ll=44.43,26.1`);
check("observator Marte: Bolta nu poate onora -> ascuns", (await vis()).hidden === true);
await go(`#v=2d&t=${T}&ll=44.43,26.1`);
check("modul 2D: ascuns", (await vis()).hidden === true);
// 4) în afara 1900–2100 -> ascuns
await go(`#v=sky&t=2150-01-01T00:00:00Z&ll=44.43,26.1`);
check("an 2150: ascuns (Bolta ignoră t în afara 1900–2100)", (await vis()).hidden === true);
await go(`#v=sky&t=1899-12-31T00:00:00Z&ll=44.43,26.1`);
check("an 1899: ascuns", (await vis()).hidden === true);
// 5) timp „live”: fără t=
await go(`#v=sky&ll=44.43,26.1`);
await page.evaluate(() => { state.simTime = new Date(); state.paused = false; ORB.refresh(); });
v = await vis();
check("timp live: fără t= în link", v.hidden === false && !/[#&]t=/.test(v.hrefs[0]) && /ll=44\.43,26\.10/.test(v.hrefs[0]), v.hrefs);
// 6) href proaspăt la click (timpul s-a schimbat între refresh-uri)
await go(`#v=sky&t=${T}&ll=44.43,26.1`);
await page.evaluate(() => { state.simTime = new Date(Date.UTC(2027, 7, 2, 10, 0, 0)); });
await page.evaluate(() => { document.querySelector("#bolta-lnk a").addEventListener("click", e => { window.__href = e.currentTarget.href; e.preventDefault(); }); });
await page.click("#bolta-lnk a");
check("href recalculat la click", (await page.evaluate(() => window.__href)).includes("t=2027-08-02T10:00:00Z"), await page.evaluate(() => window.__href));
// 7) EN
await page.evaluate(() => { document.getElementById("lang-btn").click(); });
await page.waitForTimeout(300);
check("text EN", /Bolta: the same sky, offline/.test((await vis()).txt), (await vis()).txt);
check("0 pageerror/console error", st.errs.length === 0, st.errs);
check("0 cereri de rețea", st.net.length === 0, st.net);
check("0 violări CSP", (await page.evaluate(() => window.__csp)).length === 0);
await browser.close();
summary();
