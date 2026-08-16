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

| Nr. | Abschnitt          | Anker         | Layout                              |
|-----|--------------------|---------------|-------------------------------------|
| 01  | Hero               | `#top`        | Vollbild-Bild mit Titel             |
| 02  | Welcome to the farm| `#welcome`    | Text links / Bild rechts — **Papier** |
| 03  | Life in the flock  | `#story`      | Bild oben, 3 Textspalten — **Papier** |
| 04  | Meet Sheep         | `#characters` | Text links / Bild rechts — **Nacht**, Papier-Riss oben |
| 05  | Sheep Records      | `#records`    | Bild links / Text rechts — **dunkles Grün**, Player |
| 06  | The Open Gate      | `#paper`      | Text links / Bild rechts — **Tinte** |
| 07  | The other side     | `#gate`       | Bild oben, grünes Panel mit 2 Spalten |
| —   | Abspann            | `#outro`      | Vollbild mit Text im Bild (ab 1000 px) |

**Design-Idee „Vom Tag in die Nacht":** Die Seite beginnt hell (02–03, die
Farm spricht auf Papier) und kippt bei 04 mit einem Papier-Riss in die Nacht —
ab dort gehört die Seite Sheep. Zwei Stimmen: Farm-Überschriften in der
Grotesk (`.h-display`), Sheeps Momente in der Pinselschrift der Jacke
(`.h-brush` — Hero, 04, Player, Abspann). Sektionsnummern sind Ohrmarken
(`.eyebrow .num`), über allem liegt ein feines Filmkorn (`body::after`),
und das rote Turmlicht (`--beacon`) leuchtet nur, wenn der Track läuft.

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
