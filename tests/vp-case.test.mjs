// TerRa 1.7.2 — cardul și pasul de tur „Valea Plopului” (aliniat cu ValeaPlopului1972): locație/dată corecte, afirmația „primul caz atestat” prezentată ca atribuită și neverificată, în cele 8 limbi.
// Rulare: node tests/vp-case.test.mjs
import {launch, check, summary} from "./_lib.mjs";
const HEDGE = {ro: /neverificat independent/, en: /not independently verified/, fr: /non vérifié de manière indépendante/, it: /non verificato in modo indipendente/, es: /no verificado de forma independiente/, pt: /não verificado de forma independente/, de: /nicht unabhängig überprüft/, hu: /függetlenül nem ellenőrzött/};
const {browser, page, st} = await launch({w: 390, h: 800});
const get = l => page.evaluate(l => {
  setLang(l, false);
  const u = ufoByName("Valea Plopului"); showUfoCard(u);
  const step = TOUR_STEPS.find(s => /Valea Plopului/.test(s.cap));
  return {desc: document.getElementById("uf-desc").textContent, cap: t(step.cap).replace(/<[^>]+>/g, ""), name: document.getElementById("uf-name").textContent, year: document.getElementById("uf-year").textContent, sw: document.documentElement.scrollWidth - innerWidth, cardRight: document.getElementById("ufocard").getBoundingClientRect().right - innerWidth};
}, l);
const ro = await get("ro");
check("ro: fără depășire orizontală la 390 px, card în ecran", ro.sw <= 0 && ro.cardRight <= 1, [ro.sw, ro.cardRight]);
check("ro: card cu Poșești, La Odaia, septembrie 1972, Capră, Turcu", /Poșești/.test(ro.desc) && /La Odaia/.test(ro.desc) && /septembrie 1972/.test(ro.desc) && /Capră/.test(ro.desc) && /Turcu/.test(ro.desc), ro.desc);
check("ro: afirmația „primul caz atestat” e atribuită surselor și marcată neverificat/disputat", /Prezentat în sursele citate/.test(ro.desc) && /disputat/.test(ro.desc) && HEDGE.ro.test(ro.desc), ro.desc);
check("ro: pasul de tur e hedged", /prezentat ca primul/.test(ro.cap) && HEDGE.ro.test(ro.cap), ro.cap);
check("ro: textul vechi, fără rezerve, a dispărut", !/Obiect luminos văzut aterizând/.test(ro.desc) && !/primul caz OZN expertizat științific în România \(urme/.test(ro.cap));
for (const l of ["en", "fr", "it", "es", "pt", "de", "hu"]) {
  const r = await get(l);
  check(`${l}: card tradus (diferit de ro) cu Poșești, La Odaia, 1972, Capră, Turcu`, r.desc !== ro.desc && /Poșești/.test(r.desc) && /La Odaia/.test(r.desc) && /1972/.test(r.desc) && /Capră/.test(r.desc) && /Turcu/.test(r.desc), r.desc);
  check(`${l}: card cu rezerva „neverificat independent”`, HEDGE[l].test(r.desc), r.desc);
  check(`${l}: pasul de tur tradus și cu rezerva`, r.cap !== ro.cap && HEDGE[l].test(r.cap), r.cap);
  check(`${l}: fără depășire orizontală la 390 px, card în ecran`, r.sw <= 0 && r.cardRight <= 1, [r.sw, r.cardRight]);
  check(`${l}: card fără chei brute / cu un singur paragraf`, !/undefined|\[object|\{\{/.test(r.desc + r.cap) && r.desc.length > 200);
}
check("0 erori", st.errs.length === 0, st.errs);
check("0 rețea", st.net.length === 0, st.net);
await browser.close();
summary();
