# CHANGELOG

Format: SemVer (MAJOR.MINOR.PATCH). Intrările mai vechi sunt copiate din README (secțiunea „History / Changelog”), neschimbate.

## 2.1.0 — 2026-10-27 (anterior: 2.0.0)

Stare: stabil
Offline: complet pentru hartă, Soare, Lună, planete și snapshotul de sateliți încorporat; actualizarea TLE și feedurile live cer internet (ultimul set TLE descărcat se poate reîncărca offline pe https/localhost)

Recenzie:
- **Sursa și vechimea TLE** documentate din datele reale: CelesTrak, 1 527 obiecte, epoci 2026-06-06 … 2026-07-01, mediană 2026-06-28 (≈ 120 de zile la 2026-10-27). Data exactă a descărcării nu a fost înregistrată. Panoul „Sursă de date (TLE)” arată acum sursa, intervalul și mediana epocilor, vechimea.
- **Copie locală (nou)**: ultimul set TLE descărcat se păstrează în Cache Storage (`terra-tle-v1`), cu butoane de reîncărcare și ștergere; doar https/localhost, limită 6 MB, fără dependențe.
- **Corecție**: conversia epocii TLE în zi iuliană (`jdJan1`) era cu 1–2 zile prea devreme; validat față de biblioteca Python `sgp4` (72 de sateliți, 0,001 km).
- Texte în 7 limbi (interfață) și 8 limbi (README); notă de confidențialitate despre Cache Storage.
- Teste noi: `tests/tle-cache.test.mjs` (25 de verificări).

---

## Istoric anterior (din README.md)

- **2.0.0 — 2026-10-26:** distance measurement on the WGS-84 ellipsoid (Vincenty) with the Sun's elevation at the chosen moment.
- **1.7.8 — 2026-10-22:** Text and targets: minimum 12 px in the selection cards (telemetry values, tags), the tour counter, keyboard hints and footer notes; the ephemeris-console links (↗ 📡 👁) are at least 24 px (44 px on coarse pointers). Re-audit at 360 and 1366 px: no target under 24 px and no text under 12 px.

#### 1.7.7 — 2026-10-22

fff-kit 1.1.4: touch targets and minimum text size; touch targets and text size corrected.

#### 1.7.6 — 2026-10-22
- fff-kit 1.1.2: PBKDF2 600,000 iterations, anti-clickjacking protection

#### 1.7.5 — 2026-10-22
- Mobile: text is at least 12 px and buttons and fields have larger touch targets on narrow screens.
- Accessibility: the TLE paste box, the live-feed fields (GTFS-RT, Movebank, BirdCast, CORS proxy) and the latitude/longitude fields now have names announced by screen readers (8 languages).
- On narrow screens the floating “Buy Me a Coffee” button is hidden while the controls panel is open, so it no longer covers the panel text.

- 1.7.4 — 2026-10-22: **fix**: planet names, the Hubble entry, the “Quick jump” and “Exact moment (local)” labels and the UFO-card tag now follow the interface language; the planet, notable-object and Lagrange lists are rebuilt on language change.
#### 22 October 2026 (v1.7.3)
- Fixed the day/night widget ("Time on the body"): the Earth row no longer shows "angle from the Sun NaN°" or an absurd number of minutes until noon/midnight (the solar day of the Earth was missing from the table of periods and the angle to the Sun was computed for the Earth against itself).
- Interface: the guide paragraphs, the "Load your own TLE" section, the tide labels, the case captions ("reports", "from 1981"), the satellite category legend, the "Forward/Backward" buttons and the page title/description now follow the interface language in all 8 languages.

#### 21 October 2026 (v1.7.2)
- The Valea Plopului card and tour step were reworded and attributed: "according to accounts … presented in the cited sources as the first attested and expert-assessed case … not independently verified; the case remains disputed" (no longer stated as fact); the date is "September 1972", the locality "Poșești", the measurement credited to Justin Capră "according to accounts". The tour caption is now translated in fr/it/es/pt/de/hu (it previously fell back to English). The Valea Plopului text is aligned with ValeaPlopului1972; test `tests/vp-case.test.mjs`.

#### 19 October 2026 (v1.6.0)
- New: "↗ Bolta" in Sky mode (from the ground): the same moment and the same Location in the offline planetarium Bolta; no t= when the time is "now", hidden outside 1900–2100.
- Privacy: a Location taken from GPS is rounded to ~1 km in the links to ORARIUM and Bolta.
- "← back" for the sources ECLIPSA, Eclipsa 2027, Horoscop, Field Observer, Horizons.
- The "← back" button is no longer covered by the Buy Me a Coffee widget (bottom left): it sits above it.
- A discreet warning "Reduced accuracy after 2100: ΔT extrapolated, Pluto unavailable." (ro/en, hu/de via en) only when the simulated date or the one from `t=` exceeds 2100.

#### 18 October 2026 (v1.5.0)
- New: the `ufo=<case>` parameter (e.g. `#v=2d&ufo=valea-plopului`) centres the 2D map on the case from the UFO list and opens the card, without changing "My location"; unknown values are ignored. `from=valeaplopului` shows the "← back" button to ValeaPlopului1972. The text of the case was not modified.

#### 18 October 2026 (v1.4.0)
- New: all 45 bodies of ORARIUM, with 15 bodies added (Phobos, Deimos, Hyperion, Charon, Ceres, Vesta, Pallas, Hygiea, Psyche, Eros, Bennu, Ryugu, Haumea, Makemake, Eris) as observers and targets; the ORARIUM panel lists all the bodies, with links in both directions.

#### 18 October 2026 (v1.3.0)
- New: the link with ORARIUM ("Time on other worlds" panel, banner in Sky mode, links in the tours, combined link "🔗 + ORARIUM").

#### 18 October 2026 (v1.2.0)
- New: a unique link (URL fragment) for mode, observer, moment and location, plus the "🔗 Unique link" button; link with ORARIUM.

#### 14 October 2026 (v1.1.0)
- New: "Local ephemerides" (summary line in the panel + modal window: Sun, Moon, phases, planets, twilights, editable time zone, declared accuracy); RO/EN/HU/DE language cycle for the new features; the `fff-kit` kit (`core`, `label`, `bundle`, `ephem`); `tests/fff-r8.test.mjs` (51 checks, including axe in the light and dark themes, at 1280×800 and 360×740, with the window open). Before/after comparison at 1280×800: differences under 0.05% of pixels (animation/WebGL noise), the screenshot did not change; the new section is in the controls panel.

#### 12 October 2026 (v1.0.0)
- 1.0.0 — 2026-10-12: the version and the last-updated date are shown in the application

#### 11 October 2026
- Fixed (a long-standing HTML structure defect): an extra `</div>` closed the controls panel prematurely, so nine sections (Moon phase, Planets, My location, Surface environment, Tides etc.) fell out of the panel and could not be touched; now all 19 sections are in the panel, and the time control has the title "Time — past / future".
- "My location": the decimal comma is accepted (`44,43`), and coordinates out of range give an error message instead of being silently clipped.
- A "⟳ Rotate the map" button in the header (2D only, on a narrow screen in portrait) to switch quickly between the vertical and the horizontal map; the labels remain readable in the horizontal orientation.
- Keyboard shortcuts (1/2/3, Space, N), with an EN translation in the "About" window.
- The labels in the 2D map (stations, planets, Lagrange points, probes, Sun, Moon, notable objects) no longer overlap: they are moved vertically or omitted.
- CSP: `script-src` by SHA-256 hash for the two scripts, without `'unsafe-inline'` (connections remain `https:`).
- On phones in portrait the 2D map now starts in "Vertical map" mode (it fills the screen, labels are easier to read); the top bar has a semi-transparent background.
- The "Data source (TLE)" panel warns when the embedded orbital elements are old (>7 days; on 11.10.2026 the snapshot is ~107 days old, median epoch 2026-06-26): satellite positions are approximate until "Update (online)".
- The content is wrapped in `<main>` (axe: 0 violations); a CSP was added (`default-src 'none'`, no external scripts, only `https:` for connections).
- Unresolved: the size of 2.1 MB (JPEG textures + embedded Natural Earth data); recompressing the images would gain only ~5% with visible loss.
