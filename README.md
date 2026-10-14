# Terra — Pământul în timp real

**Versiune:** 1.1.0 · **Ultima actualizare:** 14 octombrie 2026

Harta și globul Pământului cu terminatorul zi/noapte, Luna, planetele, sateliții și un mod „Cer" (planetariu), într-un singur fișier HTML.

**Live:** https://chiuta.github.io/TerRa/

![Captura de ecran](screenshot.png)

## Ce este

Terra · timp real (titlul paginii: „Pământul în timp real — Terminator · Lună · Sateliți") calculează în browser poziția Soarelui, a Lunii, a planetelor și a sateliților și le afișează pe o hartă 2D, pe un glob 3D sau într-o vedere de planetariu („Cer"). Un snapshot de date orbitale este încorporat în fișier, deci funcționează și fără internet; feedurile live sunt opționale.

## Funcții

- Moduri: **2D**, **3D** și **Cer**, plus turuburi ghidate: „▶ Tur ghidat", „🌓 Terminatoare", „🌒 Eclipse" și „🛸 Cazuri UAP/FAN".
- Terminatorul zi/noapte calculat în timp real, lumini urbane pe partea de noapte, punctul subsolar, punctul sublunar și faza Lunii.
- Control al timpului: pauză/redare, viteze (1×, 60×, 600×, 3600×, 1 zi/s), salt rapid (−7z … +7z, ±1h) și „Moment exact (local)"; „⦿ Revino la acum (live)".
- Sateliți propagați cu SGP4 (orbite joase) și model kepleriano-J2 (geostaționari); categorii: stații spațiale, vizibili cu ochiul liber, Starlink, OneWeb, GPS, Galileo, GLONASS, BeiDou, științifici, meteo, observarea Terrei, geostaționari; încărcare de TLE propriu (text sau fișier).
- Planete și Pluto/Charon ca puncte sub-planetare; obiecte notabile (ISS, Tiangong, Hubble), puncte Lagrange și sonde (JWST, Gaia, Euclid, SOHO, DSCOVR); listă de OZN-uri raportate (documentează relatări, nu afirmă origine extraterestră).
- Straturi: granițe, ape teritoriale, coastă detaliată, râuri și lacuri (Natural Earth), orașe / capitale, grilă lat/long, relief fractal procedural, hartă verticală pentru mobil.
- Modul „Cer": Calea Lactee, obiecte Messier, constelații, roiuri de meteori, ecliptica, observator de pe sol sau de pe alte corpuri; „Îndreaptă spre cer (AR)" cu busola/giroscopul telefonului.
- Treceri vizibile ale ISS pe 48 h, cu alertă (vibrație + notificare); mediu de suprafață și maree de echilibru pentru locația aleasă.
- Feeduri live opționale: avioane (ADS-B), baloane-sondă meteo, radar meteo, vreme spațială NOAA (Kp, vânt solar, raze X, oval auroral), cutremure USGS (24 h), Movebank, flux GTFS-RT prin proxy.
- Pe telefon în portret: buton „⟳ Rotește harta” (hartă verticală / orizontală).
- Interfață în română și engleză (buton „EN" / „RO"); din 1.1.0 ciclul include și HU/DE pentru funcțiile noi.
- Scurtături de tastatură: `1` / `2` / `3` (2D / 3D / Cer), `Spațiu` (pauză / reluare), `N` (înapoi la „acum”), `[` și `]` (perspectivă 3D), `Esc`; inactive cât scrii într-un câmp. Sunt descrise și în fereastra „Despre”.

## Funcții noi (1.1.0)

Secțiunea **„Efemeride locale”** din panou (linia-rezumat) și fereastra **„Deschide efemeridele locale”**, calculate local, fără rețea, cu `FFF.ephem`, pentru „Locația mea” și momentul din controlul de timp (inclusiv timp simulat):

- **Rezumat** în panou: răsărit/apus Soare, faza Lunii și iluminarea.
- **Fereastră:** Soare (răsărit, trecere, apus, durata zilei, crepuscule), Lună (fază, iluminare, vârstă, distanță, răsărit/apus, următoarele faze) și tabel cu Soare, Lună și planete (longitudine ecliptică cu semn, altitudine/azimut, răsărit/apus, magnitudine, elongație).
- Fusul orar pentru ore: al browserului implicit, editabil (nume IANA).
- Precizia declarată e în fereastră; orele sunt rotunjite la minut.
- Ciclul de limbi este acum RO → EN → HU → DE (butonul din antet); textele vechi ale aplicației rămân în română/engleză (în HU/DE se vede engleza), funcțiile noi au toate cele patru limbi. Traducerile în maghiară (hu) și germană (de) ale funcțiilor noi sunt **automate și neverificate nativ**; la fel ar fi orice altă limbă adăugată ulterior (fr/it/es/pt nu sunt oferite în această aplicație).
- Cât timp fereastra e deschisă, scurtăturile de tastatură ale aplicației (`1`/`2`/`3`/`Spațiu`/`N`) sunt inactive; `Esc` închide fereastra.

## Manual de utilizare

1. Deschideți pagina; alegeți **2D**, **3D** sau **Cer** din bara de sus.
2. Setați locația în panoul „Locația mea" (buton „📍 Detectează" sau coordonate manuale) pentru treceri ISS, maree și vederea de pe sol.
3. Deschideți ☰ pentru „Straturi" și celelalte panouri; bifați ce doriți să vedeți.
4. Controlați timpul din bara de jos (pauză, viteză, salturi, „Moment exact"); „⦿ Revino la acum (live)" revine la ora curentă.
5. Trageți pentru a roti/panorama, derulați sau ciupiți pentru zoom; atingeți un satelit sau un marcator pentru detalii și urma orbitală. În modul 3D, tastele `[` și `]` derulează perspectivele de observare.
6. Pentru date actuale: „⟲ Actualizează (online)" în panoul de sateliți; „↺ Revino la snapshotul offline" revine la datele încorporate.
7. Feeduri live: apăsați butoanele „Adu …" din panourile respective (ele sunt oprite implicit).
8. Schimbați limba cu butonul „EN"/„RO".

## Confidențialitate și rețea

- Aplicația nu folosește cookie-uri, `localStorage` sau alt tip de stocare locală (nu am găsit apeluri de stocare în cod) și nu are analitice.
- Fără acțiunile dumneavoastră, aplicația nu face cereri de rețea. Când activați funcții online, browserul contactează direct:
  - `celestrak.org` (TLE sateliți) și, ca rezervă, `raw.githubusercontent.com` (oglindă CelesTrak);
  - `services.swpc.noaa.gov` (vreme spațială, oval auroral) și `earthquake.usgs.gov` (cutremure);
  - `api.open-meteo.com` (meteo curent la locația aleasă);
  - `opendata.adsb.fi` și `api.adsb.lol` (avioane în jurul locației dumneavoastră, coordonatele sunt trimise în cerere);
  - `api.v2.sondehub.org` (baloane-sondă), `api.rainviewer.com` și `tilecache.rainviewer.com` (radar meteo), `www.movebank.org` (date de animale, studii publice);
  - `corsproxy.io`, doar dacă introduceți/folosiți un proxy CORS pentru surse care nu permit accesul direct; proxy-ul vede cererea respectivă (aplicația avertizează explicit).
- Geolocația („📍 Detectează") se cere doar la apăsare; notificările pentru alerta ISS doar dacă activați alerta.

- 1.1.0: efemeridele locale nu fac cereri de rețea și nu stochează nimic; folosesc „Locația mea” deja setată (geolocația „📍 Detectează” rămâne la cerere, ca înainte). Kitul `fff-kit` (`core`, `label`, `bundle`, `ephem`) adaugă butonul de transparență; la pornire nu scrie nimic în `localStorage`. Feedurile online enumerate mai sus nu s-au schimbat.
## Notă despre cazurile OZN/UAP

Lista de cazuri documentează relatări și nu afirmă origine extraterestră. Afirmațiile atribuite unor persoane reale (martori, anchetatori, cercetători) sunt redate din literatura citată și **nu au fost verificate independent**; nota apare și în pagină (panoul „OZN-uri raportate” și secțiunea „Despre”, RO/EN). Lista conține în prezent 94 de cazuri (textul din pagină spune „peste 70”, ceea ce rămâne adevărat).

## Limite (funcțiile noi)

- **Efemeride locale — precizie.** Față de JPL DE421/DE423: poziții aparente ale Soarelui și planetelor ≤ 3″ (Neptun ≤ 5″, Pluto ≤ 7″), Luna ≤ 1,5″; răsărit/apus Soare ≤ 6 s, Lună ≤ 25 s; faze ≤ 30 s. Față de pyephem 4.2.1 (test în `tests/`): răsărit/apus ≤ 0,5 s, faze ≤ 6 s, alt/az ≤ 0,003°. Orele sunt rotunjite la minut. În realitate răsăritul/apusul diferă cu minute (refracție reală, relief, altitudine — nemodelate); ΔT e incert cu ≈ ±1 s în 2027. Nu e potrivit pentru navigație. Calculele existente ale hărții/globului/cerului (terminator, Lună, planete în vedere) nu au fost înlocuite și nu au fost modificate; poziția sateliților rămâne dependentă de vârsta elementelor TLE.

## Teste

`node tests/fff-r8.test.mjs` (Playwright din `/opt/node-tools`, Chromium local, rețeaua blocată; `tests/_lib.mjs` are ajutoarele comune). Valorile de referință sunt în `tests/ref-c3a.json`: momentele de răsărit/apus/trecere (Soare, Lună; 5 locuri × 4 date), 56 de momente de fază și 54 de poziții alt/az, calculate independent cu **pyephem 4.2.1** (folosit doar offline pentru a genera numerele; nu face parte din aplicație). Fiecare test are pragul scris în cod; testul de accesibilitate (axe-core, `bypassCSP`) rulează și în dialoguri/panouri deschise, la 1280×800 și 360×740.

## Rulare locală / offline

Descărcați `index.html` și deschideți-l în browser. Poziția Soarelui, Lunii, planetelor, terminatorul, eclipsele și sateliții din snapshotul încorporat funcționează fără internet; actualizarea TLE și feedurile live necesită internet.

## Licență

CC0 1.0 Universal (domeniu public) — vezi fișierul LICENSE

## Audit

2026-10-10: verificat în browser că la încărcare și în repaus nu pleacă nicio cerere de rețea; cererile apar doar la acțiunile descrise mai sus. Pagina nu avea politică CSP; la 2026-10-11 a fost adăugată una, cu `connect-src`/`img-src` limitate la `https:` (nu la o listă fixă de gazde), fiindcă proxy-ul CORS, adresa GTFS-RT și imaginea BirdCast sunt introduse de utilizator și pot fi pe orice domeniu HTTPS. Corectate accesibilitatea (nume pentru comutatoare, zoom permis) fără modificări de funcționalitate.

## Autor

Alexio — Alexandru-Ionuț Chiuță. Contact: alexio@trom.tf

## English summary

Terra is a single-file real-time Earth viewer: day/night terminator, Moon, planets, satellites (SGP4), eclipses, a 3D globe and a sky planetarium mode, with RO/EN UI. An orbital snapshot is embedded, so it works offline. Optional live feeds contact CelesTrak, NOAA SWPC, USGS, Open-Meteo, adsb.fi/adsb.lol, SondeHub, RainViewer, Movebank and, if configured, a CORS proxy (corsproxy.io). No local storage. CC0 1.0.

## Istoric / Changelog

### 14 octombrie 2026 (v1.1.0)
- Nou: „Efemeride locale” (linie-rezumat în panou + fereastră modală: Soare, Lună, faze, planete, crepuscule, fus orar editabil, precizie declarată); ciclu de limbi RO/EN/HU/DE pentru funcțiile noi; kitul `fff-kit` (`core`, `label`, `bundle`, `ephem`); `tests/fff-r8.test.mjs` (51 de verificări, inclusiv axe în tema luminoasă și cea întunecată, la 1280×800 și 360×740, cu fereastra deschisă). Comparație înainte/după la 1280×800: diferențe sub 0,05 % din pixeli (zgomot de animație/WebGL), captura de ecran nu s-a schimbat; noua secțiune e în panoul de comenzi.

### 12 octombrie 2026 (v1.0.0)
- 1.0.0 — 2026-10-12: versiunea și data ultimei actualizări sunt afișate în aplicație

### 11 octombrie 2026
- Reparat (defect vechi de structură HTML): un `</div>` în plus închidea prematur panoul de comenzi, deci nouă secțiuni (Faza Lunii, Planete, Locația mea, Mediu de suprafață, Maree etc.) ieșeau din panou și nu puteau fi atinse; acum toate cele 19 secțiuni sunt în panou, iar controlul timpului are titlul „Timp — trecut / viitor”.
- „Locația mea”: virgula zecimală este acceptată (`44,43`), iar coordonatele în afara intervalului dau un mesaj de eroare în loc să fie tăiate în tăcere.
- Buton „⟳ Rotește harta” în antet (doar în 2D, pe ecran îngust în portret) pentru a comuta rapid între harta verticală și cea orizontală; etichetele rămân citibile în orientarea orizontală.
- Scurtături de tastatură (1/2/3, Spațiu, N), cu traducere EN în fereastra „Despre”.
- Etichetele din harta 2D (stații, planete, puncte Lagrange, sonde, Soare, Lună, obiecte notabile) nu se mai suprapun: se mută pe verticală sau se omit.
- CSP: `script-src` pe hash SHA-256 pentru cele două scripturi, fără `'unsafe-inline'` (conexiunile rămân `https:`).
- Pe telefoane în portret harta 2D pornește acum în modul „Hartă verticală” (umple ecranul, etichete mai ușor de citit); bara de sus are fundal semitransparent.
- Panoul „Sursă de date (TLE)” avertizează când elementele orbitale încorporate sunt vechi (>7 zile; la 11.10.2026 snapshotul are ~107 zile, epocă mediană 2026-06-26): pozițiile sateliților sunt aproximative până la „Actualizează (online)”.
- Conținutul este încadrat în `<main>` (axe: 0 încălcări); adăugat CSP (`default-src 'none'`, fără scripturi externe, doar `https:` pentru conexiuni).
- Nerezolvat: dimensiunea de 2,1 MB (texturi JPEG + date Natural Earth încorporate); recomprimarea imaginilor ar câștiga doar ~5% cu pierdere vizibilă.
