// TerRa 2.2.0 — SDP4 (spațiu adânc) validat față de biblioteca Python `sgp4` (referința e în tests/sdp4-ref.json, generată cu tests/gen-sdp4-ref.py).
// Fără browser: extrage scriptul SGP4 din index.html. Rulare: node tests/sdp4.test.mjs
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; import {fileURLToPath} from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(HERE, '..', 'index.html'), 'utf8');
const a = html.indexOf('<script>/* SGP4 (near-earth)'), b = html.indexOf('</script>', a);
const ctx = {module: {exports: {}}, exports: {}}; ctx.root = ctx; vm.createContext(ctx);
vm.runInContext(html.slice(a + 8, b).replace(/\}\)\(this\);?\s*$/, '})(this);'), ctx);
const S = ctx.module.exports && ctx.module.exports.parseTLE ? ctx.module.exports : ctx.SGP4;
const R = JSON.parse(fs.readFileSync(path.join(HERE, 'sdp4-ref.json'), 'utf8'));
let ok = 0, bad = 0; const t = (n, c, x) => { if (c) { ok++; } else { bad++; console.log('  FAIL', n, x === undefined ? '' : JSON.stringify(x).slice(0, 300)); } };
let nDeep = 0, nNear = 0, maxDeep = 0, maxNear = 0, maxV = 0, irez = {0: 0, 1: 0, 2: 0};
for (const e of R.ref) {
  const rec = S.parseTLE(e.name, e.l1, e.l2);
  if (rec.deep) irez[rec.irez || 0]++;
  R.ts.forEach((tm, i) => {
    const p = S.propagate(rec, tm), q = e.res[i];
    if (q === null) { return; }  // Python raportează eroare (decădere/excentricitate): JS poate folosi rezerva keplerian-J2, nu comparăm
    if (!p) { t(`${e.name} t=${tm}: JS fără rezultat unde Python are`, false); return; }
    const d = Math.hypot(p[0][0] - q[0][0], p[0][1] - q[0][1], p[0][2] - q[0][2]), dv = Math.hypot(p[1][0] - q[1][0], p[1][1] - q[1][1], p[1][2] - q[1][2]);
    if (rec.deep) { nDeep++; maxDeep = Math.max(maxDeep, d); } else { nNear++; maxNear = Math.max(maxNear, d); }
    maxV = Math.max(maxV, dv);
    t(`${e.name} t=${tm}: poziție la <1e-4 km de Python`, d < 1e-4, d);
  });
}
console.log(`  puncte spațiu adânc: ${nDeep} (max abatere ${maxDeep.toExponential(2)} km) · near-earth: ${nNear} (${maxNear.toExponential(2)} km) · max viteză ${maxV.toExponential(2)} km/s · rezonanțe: irez0=${irez[0]} irez1(geosincron)=${irez[1]} irez2(12 h)=${irez[2]} · sgp4 Python ${R.sgp4_python_version}`);
t('există sateliți deep cu irez 0, 1 și 2 în referință', irez[0] > 0 && irez[1] > 0 && irez[2] > 0, irez);
t('cel puțin 400 de puncte deep comparate', nDeep >= 400, nDeep);
// GEO: raza orbitei rămâne ~42 164 km pe 30 de zile (cu Kepler+J2 vechi ar fi la fel, deci doar verificare de bun-simț; validarea reală e cea de mai sus)
const geo = R.ref.find(e => e.set === 'embed_deep' && S.parseTLE(e.name, e.l1, e.l2).irez === 1);
if (geo) { const rec = S.parseTLE(geo.name, geo.l1, geo.l2); const rr = [0, 1440, 43200].map(m => Math.hypot(...S.propagate(rec, m)[0])); t('GEO: raza 42 000–42 300 km', rr.every(x => x > 42000 && x < 42300), rr); }
console.log(`${bad} eșecuri, ${ok} reușite`); process.exit(bad ? 1 : 0);
