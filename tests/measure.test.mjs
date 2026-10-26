// TerRa 2.0.0 — măsurare pe elipsoidul WGS-84 (Vincenty) + elevația Soarelui la momentul ales.
// Rulare: node tests/measure.test.mjs
import {launch, check, summary, hOverflow} from "./_lib.mjs";
const {browser, page, st} = await launch();
const go = async h => { await page.goto(page.url().split("#")[0] + h); await page.reload(); await page.waitForTimeout(2200); };
await go("#v=2d&t=2026-06-21T12:00:00Z");
// --- matematică
const M = await page.evaluate(() => {
  const dms = (d, m, s) => d + m / 60 + s / 3600;
  const fl = vincentyInv(-dms(37, 57, 3.7203), dms(144, 25, 29.5244), -dms(37, 39, 10.1561), dms(143, 55, 35.3839));
  return {
    fl, jfk: vincentyInv(40.6413, -73.7781, 51.47, -0.4543), eq: vincentyInv(0, 0, 0, 90), mer: vincentyInv(0, 0, 90, 0),
    anti: vincentyInv(0, 0, 0.5, 179.7), same: vincentyInv(10, 20, 10, 20), sph: sphereDist(0, 0, 0, 90),
    e1: sunElevAt(10, 20, {lat: 10, lon: 20}), e2: sunElevAt(-10, -160, {lat: 10, lon: 20}), e3: sunElevAt(0, 110, {lat: 0, lon: 20}),
    ph: [sunPhaseName(5), sunPhaseName(-3), sunPhaseName(-8), sunPhaseName(-15), sunPhaseName(-30)]
  };
});
check("Vincenty: Flinders Peak–Buninyong = 54972.271 m (referința Geoscience Australia)", Math.abs(M.fl.s - 54972.271) < 0.01, M.fl);
check("Vincenty: azimut inițial Flinders→Buninyong ≈ 306°52'05\"", Math.abs(M.fl.az1 - 306.868159) < 1e-4, M.fl);
check("JFK–LHR între 5530 și 5560 km", M.jfk.s > 5530e3 && M.jfk.s < 5560e3, M.jfk);
check("sfert de Ecuator = a·π/2 = 10 018 754 m", Math.abs(M.eq.s - 10018754.17) < 0.5, M.eq);
check("sfert de meridian ≈ 10 001 966 m", Math.abs(M.mer.s - 10001965.73) < 1, M.mer);
check("puncte aproape antipodale: null (fără cifre inventate)", M.anti === null);
check("același punct: 0 m", M.same && M.same.s === 0);
check("sferă: sfert de cerc mare ≈ 10 007 557 m", Math.abs(M.sph - 10007557.2) < 5, M.sph);
check("elipsoid ≠ sferă (diferență măsurabilă pe Ecuator)", Math.abs(M.sph - M.eq.s) > 1000);
check("elevația Soarelui: 90° la punctul subsolar, −90° la antipod, 0° la 90° de longitudine", Math.abs(M.e1 - 90) < 1e-3 && Math.abs(M.e2 + 90) < 1e-3 && Math.abs(M.e3 - Math.asin(Math.cos(90 * Math.PI / 180) * 0 + Math.cos(0) * Math.cos(0) * Math.cos(90 * Math.PI / 180)) * 180 / Math.PI) < 1e-9, M);
check("faze: zi / amurg civil / nautic / astronomic / noapte", M.ph.join() === "zi,amurg civil,amurg nautic,amurg astronomic,noapte", M.ph);
// --- UI
check("card ascuns la început", await page.evaluate(() => getComputedStyle(document.getElementById("meascard")).display) === "none");
await page.evaluate(() => document.getElementById("btn-meas").click());
check("buton: aria-pressed=true, card vizibil", await page.evaluate(() => document.getElementById("btn-meas").getAttribute("aria-pressed") === "true" && getComputedStyle(document.getElementById("meascard")).display !== "none"));
const clickLL = async (lat, lon) => { const p = await page.evaluate(([la, lo]) => { const r = cv.getBoundingClientRect(), xy = ll2s(la, lo); return [r.left + xy[0], r.top + xy[1]]; }, [lat, lon]); await page.mouse.click(p[0], p[1]); await page.waitForTimeout(150); };
await clickLL(0, 0);
let r = await page.evaluate(() => ({n: MEAS.pts.length, hint: document.getElementById("ms-hint").textContent, body: document.getElementById("ms-body").textContent}));
check("un punct: indiciu pentru al doilea, elevație Soare afișată", r.n === 1 && /al doilea punct/.test(r.hint) && /Soare/.test(r.body), r);
const near = await page.evaluate(() => MEAS.pts[0]);
const el0 = await page.evaluate(() => { const q = MEAS.pts[0]; return sunElevAt(q[0], q[1], state._ssub); });
check("21 iunie 12:00 UTC: Soarele la ~66° în (0°,0°)", el0 > 63 && el0 < 69, el0);
await clickLL(40, 50);
r = await page.evaluate(() => ({n: MEAS.pts.length, res: MEAS.res, body: document.getElementById("ms-body").textContent, hint: document.getElementById("ms-hint").textContent}));
const exp = await page.evaluate(() => { const p = MEAS.pts; return vincentyInv(p[0][0], p[0][1], p[1][0], p[1][1]).s; });
check("două puncte: distanța geodezică afișată = Vincenty", r.n === 2 && r.res && r.res.ell && Math.abs(r.res.ell.s - exp) < 1e-6 && r.body.includes("Distanță geodezică (WGS-84)"), r.body);
check("rezultat include sferă, diferență, azimut", /Distanță pe sferă/.test(r.body) && /Diferență/.test(r.body) && /Azimut inițial → final/.test(r.body), r.body);
check("2 puncte: nicio carte de satelit deschisă", await page.evaluate(() => getComputedStyle(document.getElementById("satcard")).display) === "none");
await clickLL(-20, -60);
r = await page.evaluate(() => MEAS.pts.length);
check("al treilea clic reîncepe (1 punct)", r === 1, r);
await clickLL(-20, 20);
await page.evaluate(() => document.getElementById("ms-reset").click());
check("Resetează: 0 puncte", await page.evaluate(() => MEAS.pts.length) === 0);
await clickLL(51.5, -0.1); await clickLL(-33.9, 18.4);
const syd = await page.evaluate(() => MEAS.res.ell.s / 1000);
check("Londra–Cape Town între 9 600 și 9 750 km", syd > 9600 && syd < 9750, syd);
// momentul ales: noaptea la 180°
await clickLL(0, -120);
const night = await page.evaluate(() => document.getElementById("ms-body").textContent);
check("(0°,120°V) la 12 UTC: noapte", /noapte/.test(night), night);
// EN
await page.evaluate(() => document.getElementById("lang-btn").click()); await page.waitForTimeout(500);
await page.evaluate(() => document.getElementById("ms-reset").click()); await clickLL(10, 10); await clickLL(20, 30);
const en = await page.evaluate(() => document.getElementById("ms-body").textContent);
check("EN: etichete traduse", /Geodesic distance \(WGS-84\)/.test(en) && /Initial → final azimuth/.test(en), en);
check("EN: nota despre geoid tradusă", /not on the geoid/.test(await page.evaluate(() => document.getElementById("ms-note").textContent)));
// Escape
await page.keyboard.press("Escape"); await page.waitForTimeout(150);
check("Esc oprește măsurarea și ascunde cardul", await page.evaluate(() => !MEAS.on && getComputedStyle(document.getElementById("meascard")).display === "none" && MEAS.pts.length === 0));
// din Cer → comută în 2D
await page.evaluate(() => setMode("sky")); await page.waitForTimeout(300);
await page.evaluate(() => document.getElementById("btn-meas").click()); await page.waitForTimeout(300);
check("pornit din modul Cer: trece în 2D", await page.evaluate(() => state.mode) === "2d");
await page.evaluate(() => document.getElementById("btn-meas").click());
check("0 erori", st.errs.length === 0, st.errs);
check("0 cereri de rețea", st.net.length === 0, st.net);
check("0 violări CSP", (await page.evaluate(() => window.__csp)).length === 0);
await browser.close();
// mobil
{
  const {browser: b2, page: p2, st: s2} = await launch({w: 390, h: 740});
  await p2.goto(p2.url().split("#")[0] + "#v=2d"); await p2.reload(); await p2.waitForTimeout(2000);
  await p2.evaluate(() => { try { document.getElementById("console").classList.add("open"); } catch (e) {} document.getElementById("btn-meas").click(); });
  await p2.waitForTimeout(300);
  const g = await p2.evaluate(() => { const c = document.getElementById("meascard").getBoundingClientRect(); return {l: c.left, r: c.right, w: innerWidth}; });
  check("390 px: cardul încape în ecran", g.l >= 0 && g.r <= g.w + 0.5, g);
  check("390 px: fără defilare orizontală", (await hOverflow(p2)) <= 0);
  check("390 px: 0 erori", s2.errs.length === 0, s2.errs);
  await b2.close();
}
summary();
