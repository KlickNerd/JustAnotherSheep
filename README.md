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

## Lokal ansehen

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Sektionen

| Nr. | Abschnitt          | Anker         | Layout                              |
|-----|--------------------|---------------|-------------------------------------|
| 01  | Hero               | `#top`        | Vollbild-Bild mit Titel             |
| 02  | Welcome to the farm| `#welcome`    | Text links (grün) / Bild rechts     |
| 03  | Life in the flock  | `#story`      | Bild oben, darunter 3 Textspalten   |
| 04  | Meet Sheep         | `#characters` | Text links (grün) / Bild rechts     |
| 05  | Sheep Records      | `#records`    | Bild links / Text rechts (creme)    |
| 06  | The Open Gate      | `#paper`      | Text links (schwarz) / Bild rechts  |
| 07  | The other side     | `#gate`       | Bild oben, grünes Panel mit 2 Spalten |

### Weitere Sektionen (08–10) ergänzen

In `index.html` steht direkt nach Sektion 07 ein markierter Kommentarblock.
Dort eine der vorhandenen Sektionen kopieren, `id` und Inhalt anpassen — die
Layouts sind wiederverwendbar:

* `.section.flock` → Bild oben + Textspalten
* `.section.split` → Text links / Bild rechts
* `.section.split.split--reverse` → Bild links / Text rechts
* `.section.gate` → Bild oben + farbiges Panel

Farbvarianten: `.split--green`, `.split--cream`, `.split--ink`, `.section--cream`.
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
