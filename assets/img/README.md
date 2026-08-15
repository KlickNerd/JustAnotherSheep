# Bilder / Images

Lege die Artworks mit **genau diesen Dateinamen** in diesen Ordner. Solange eine
Datei fehlt, zeigt die Seite automatisch `placeholder.svg` an — sie bleibt also
immer funktionsfähig.

| Datei             | Abschnitt                | Motiv                                        | Empfohlen            |
|-------------------|--------------------------|----------------------------------------------|----------------------|
| ✅ `hero.jpg` + `hero.webp`, `hero-1200.*`, `hero-mobile.*` | 01 / Hero | Sheep vor dem Turm | **erledigt** |
| ✅ `welcome.*`, `welcome-1200.*`, `welcome-mobile.*` | Welcome (nach dem Hero) | Schäfer öffnet das Tor | **erledigt** |
| `flock.jpg`       | 02 / Life in the flock   | Schäfer im Futterstall                        | 2400 × 1125 (21:9)   |
| `sheep-wall.jpg`  | 03 / Meet Sheep          | Sheep sprüht „BAAAAAHN THE SYSTEM"            | 1600 × 1600 (quadr.) |
| `studio.jpg`      | 04 / Sheep Records       | Sheep im Barn-Studio                          | 1600 × 1600 (quadr.) |
| `gate.jpg`        | 05 / The other side      | Sheep am Tor, Blick nach SOLANGELES           | 2400 × 1125 (21:9)   |
| ✅ `og-cover.jpg` | Social Preview | aus dem Hero geschnitten | **erledigt** |
| ✅ `apple-touch-icon.png` | iOS Homescreen | Sheeps Kopf aus dem Hero | **erledigt** |

## Tipps für Mobile

* Die Bilder vorher auf **max. 2400 px Breite** skalieren und als JPEG mit
  Qualität ~75 exportieren (Ziel: unter 400 KB pro Bild).
* Noch besser: zusätzlich `.webp` erzeugen und im HTML ein `<picture>` daraus
  machen — das spart auf dem Handy nochmal ~30 %.
* Für die Split-Sektionen (03/04) werden auf dem Handy 4:3-Ausschnitte aus der
  Bildmitte gezeigt. Über `object-position` in `styles.css` lässt sich der
  Bildausschnitt pro Sektion verschieben.

## Was mit dem Hero passiert ist

Die Originale liegen unverändert unter `assets/originals/` (`hero.png`,
`welcome.png`) und werden von der Seite **nicht** geladen. Daraus erzeugt sind:

* `hero.jpg` / `hero.webp` — volle Breite (1672 px) für große Screens
* `hero-1200.jpg` / `.webp` — für mittlere Screens
* `hero-mobile.jpg` / `.webp` — eigener Hochkant-Ausschnitt fürs Handy,
  auf Sheep zentriert (600 × 941)

Eingebunden über `<picture>`: der Browser lädt genau eine Fassung — WebP, wenn
er es kann. Auf dem Handy sind das **62 KB statt 2,4 MB**.

Neue Fassungen erzeugen (falls das Original mal ausgetauscht wird): siehe die
Größen oben, JPEG Qualität 80 / WebP 78.
