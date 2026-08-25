# Just Another Sheep — Website

Statische Startseite, aufgebaut nach den Design-Vorlagen. Kein Build-Prozess,
kein Framework: HTML + CSS + ein bisschen Vanilla-JS. Einfach auf jeden
beliebigen Webspace (oder GitHub Pages / Netlify / Vercel) hochladen.

## Struktur

```
index.html               alle Sektionen
assets/css/styles.css    komplettes Design (mobile first)
assets/css/fonts.css     @font-face für die selbst gehosteten Schriften
assets/js/main.js        Menü, Scroll-Effekte
assets/fonts/            Archivo, Archivo Black, Oswald, EB Garamond, Permanent Marker
assets/img/              hier kommen die Bilder rein → siehe assets/img/README.md
```

## Bilder einfügen

Die Artworks fehlen noch. Sie müssen nur mit den richtigen Dateinamen in
`assets/img/` liegen (`hero.jpg`, `flock.jpg`, `sheep-wall.jpg`, `studio.jpg`,
`gate.jpg`) — die genaue Liste mit empfohlenen Größen steht in
[`assets/img/README.md`](assets/img/README.md).

Solange ein Bild fehlt, zeigt die Seite automatisch einen Platzhalter an,
statt kaputt auszusehen.

## Extras

* `404.html` — eigene Fehlerseite für GitHub Pages, im Ton der Welt
  („There is no pasture here."). Nutzt absolute Pfade auf
  `/JustAnotherSheep/` — bei eigener Domain anpassen.
* Favicon ist die Ohrmarke der Herde (`assets/img/favicon.svg`).

## Lokal ansehen

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Sektionen

| Nr. | Abschnitt          | Anker         | Layout                                  |
|-----|--------------------|---------------|-----------------------------------------|
| —   | Hero               | `#top`        | Vollbild-Bild, Lautsprecher-Ansage      |
| 01  | Welcome to the farm| `#welcome`    | Aushang-Karte links / Bild rechts       |
| 02  | Life in the flock  | `#story`      | Bild-Band, Text + Stundenplan-Aushang   |
| 03  | Meet Sheep         | `#characters` | Nacht-Panel, Personalakte, Bild links   |
| 04  | Sheep Records      | `#records`    | Nacht-Panel, Vorfallsbericht + Player   |
| 05  | The Open Gate      | `#paper`      | Zeitungs-Layout, Bild links             |
| 06  | The other side     | `#gate`       | Bild-Band, Warnschild + Sheeps Zeile    |
| —   | The farm is still watching | `#outro` | Vollbild-Nachtbild mit CTA          |

**Design-Richtung „Farm-Bulletin":** Die Seite spricht mit zwei Stimmen.
Die Oberfläche ist die Farm selbst — freundliche Amtssprache, Aushänge,
Stundenpläne, Zählungen, alles einen Tick zu ordentlich (Oswald versal,
Papiertöne, Doppellinien-Rahmen). Dazwischen bricht Sheeps Handschrift
durch (Permanent Marker): Randnotizen, durchgestrichene Amtszeilen, ein
trockener Satz. Die Punchline kommt nie aus Erklärung, sondern aus dem
Widerspruch — der Besucher entdeckt die Risse selbst. The Open Gate
spricht als Zeitung (EB Garamond), Sheeps Territorium (Meet Sheep,
Records, Outro) liegt in Nacht-Panels. Akzent ist ein Stempelrot
(`--red`), sparsam wie ein Amtssiegel.

### Weitere Sektionen (08–10) ergänzen

In `index.html` steht direkt nach Sektion 07 ein markierter Kommentarblock.
Dort eine der vorhandenen Sektionen kopieren, `id` und Inhalt anpassen — die
Layouts sind wiederverwendbar:

* `.section.flock` → Bild oben + Textspalten
* `.section.split` → Text links / Bild rechts
* `.section.split.split--reverse` → Bild links / Text rechts
* `.section.gate` → Bild oben + farbiges Panel

Farbvarianten: `.split--paper`, `.split--night`, `.split--forest`, `.split--ink`,
`.split--green`, `.split--cream`, `.section--cream`.
Mit `.split--whole` bleibt das Bild ungeschnitten (für Motive, deren Aussage am
Bildrand steht).
Die Navigation verlinkt bereits auf `#token` für die kommende `$SHEEP`-Sektion.

## Mobile-Optimierung

* Mobile first: die Standard-Styles sind die Handy-Styles, Desktop kommt erst
  ab 1000 px dazu.
* `100svh` für den Hero — kein Springen, wenn die Browserleiste in iOS Safari
  ein- und ausblendet.
* `env(safe-area-inset-*)` für Notch und Home-Indicator.
* Alle Schriftgrößen und Abstände über `clamp()` — stufenlos statt sprunghaft.
* Alle Tap-Ziele mindestens 48 px hoch.
* Vollflächiges Menü mit Scroll-Lock, das die Scrollposition behält.
* Bilder mit `width`/`height` bzw. `aspect-ratio` → kein Layout-Springen beim
  Laden; alles außer dem Hero lädt `loading="lazy"`.
* Auf dem Handy werden hochformatigere Bildausschnitte (4:3) genutzt, damit die
  Motive nicht zu Streifen zusammenfallen.
* Kein horizontales Scrollen (geprüft bei 320–1440 px).
* Schriften selbst gehostet: schneller, keine Google-Fonts-Einbindung und damit
  kein DSGVO-Thema.
* `prefers-reduced-motion` schaltet alle Animationen ab.
* Ohne JavaScript bleibt die komplette Seite lesbar.

## Anpassen

Alle Farben, Schriften und Abstände stehen als Custom Properties oben in
`assets/css/styles.css` (`:root`) — dort einmal ändern, wirkt überall.

## Schriften

Selbst gehostet aus Google Fonts, alle unter der SIL Open Font License 1.1:
Archivo, Archivo Black, Oswald, EB Garamond, Permanent Marker.
Die Brush-Schrift im Hero (`--f-brush`) ist eine Annäherung an das Logo —
sobald die Original-Schrift vorliegt, einfach in `:root` austauschen oder das
Logo als SVG einsetzen.
