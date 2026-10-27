# Generează tests/sdp4-ref.json cu poziții/viteze de referință din biblioteca Python `sgp4` (pip install sgp4; WGS72).
# Rulare (din rădăcina depozitului): python3 tests/gen-sdp4-ref.py <ver.tle> <index.html>
#   <ver.tle> = SGP4-VER.TLE din pachetul `sgp4` (setul de verificare Vallado); <index.html> = pentru TLE-urile încorporate (EMBED) de spațiu adânc.
import sys, json, re, math
from sgp4.api import Satrec, WGS72
ts = [0, 10, 100, 720, 1440, -1440, 4320, 10080, 43200, -10080]
def triples(lines):
    out = []
    for i, l in enumerate(lines):
        if l.startswith('1 ') and i + 1 < len(lines) and lines[i + 1].startswith('2 '):
            out.append((lines[i - 1].strip() if i and not lines[i - 1].startswith(('1 ', '2 ')) else 'sat' + l[2:7], l, lines[i + 1]))
    return out
sets = {'vallado': triples(open(sys.argv[1]).read().split('\n'))}
html = open(sys.argv[2], encoding='utf-8').read()
E = json.loads(re.search(r'const EMBED = (\{.*?\});\n', html).group(1))
deep = {0: [], 1: [], 2: []}
for v in E.values():
    for n, l1, l2 in triples(v.split('\n')):
        s = Satrec.twoline2rv(l1, l2, WGS72)
        if 2 * math.pi / s.no_kozai >= 225.0:  # aproximație; irez din rezonanță
            nm = s.no_kozai * 1.0
            irez = 1 if 0.0034906585 < nm < 0.0052359877 else (2 if (8.26e-3 <= nm <= 9.24e-3 and s.ecco >= 0.5) else 0)
            deep[irez].append((n, l1, l2))
sets['embed_deep'] = deep[0] + deep[2] + deep[1][:12]
ref = []
for grp, L in sets.items():
    for n, l1, l2 in L:
        s = Satrec.twoline2rv(l1, l2, WGS72); res = []
        for t in ts:
            e, r, v = s.sgp4_tsince(t); res.append(None if e else [list(r), list(v)])
        ref.append({'set': grp, 'name': n, 'l1': l1, 'l2': l2, 'res': res})
json.dump({'ts': ts, 'sgp4_python_version': __import__('sgp4').__version__, 'ref': ref}, open('tests/sdp4-ref.json', 'w'))
print(len(ref), 'sateliți')
