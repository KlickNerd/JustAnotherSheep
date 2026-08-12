# Bilder / Images

Lege die Artworks mit **genau diesen Dateinamen** in diesen Ordner. Solange eine
Datei fehlt, zeigt die Seite automatisch `placeholder.svg` an — sie bleibt also
immer funktionsfähig.

| Datei             | Abschnitt                | Motiv                                        | Empfohlen            |
|-------------------|--------------------------|----------------------------------------------|----------------------|
| `hero.jpg`        | 01 / Hero                | Sheep vor dem Turm, Herde dahinter            | 2400 × 1350 (16:9)   |
| `flock.jpg`       | 02 / Life in the flock   | Schäfer im Futterstall                        | 2400 × 1125 (21:9)   |
| `sheep-wall.jpg`  | 03 / Meet Sheep          | Sheep sprüht „BAAAAAHN THE SYSTEM"            | 1600 × 1600 (quadr.) |
| `studio.jpg`      | 04 / Sheep Records       | Sheep im Barn-Studio                          | 1600 × 1600 (quadr.) |
| `gate.jpg`        | 05 / The other side      | Sheep am Tor, Blick nach SOLANGELES           | 2400 × 1125 (21:9)   |
| `og-cover.jpg`    | Social Preview           | frei wählbar                                  | 1200 × 630           |
| `apple-touch-icon.png` | iOS Homescreen      | Logo auf dunklem Grund                        | 180 × 180            |

## Tipps für Mobile

* Die Bilder vorher auf **max. 2400 px Breite** skalieren und als JPEG mit
  Qualität ~75 exportieren (Ziel: unter 400 KB pro Bild).
* Noch besser: zusätzlich `.webp` erzeugen und im HTML ein `<picture>` daraus
  machen — das spart auf dem Handy nochmal ~30 %.
* Für die Split-Sektionen (03/04) werden auf dem Handy 4:3-Ausschnitte aus der
  Bildmitte gezeigt. Über `object-position` in `styles.css` lässt sich der
  Bildausschnitt pro Sektion verschieben.
