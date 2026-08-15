# Bilder / Images

Alle Motive der Startseite sind eingebaut. Kommt ein neues dazu (oder wird eins
ausgetauscht), gilt: Original nach `assets/originals/` legen, daraus die drei
Web-Fassungen erzeugen (volle Breite, mittlere Größe, Handy-Ausschnitt) und per
`<picture>` einbinden. Fehlt eine Datei, zeigt die Seite `placeholder.svg` statt
eines kaputten Bildes.

| Datei             | Abschnitt                | Motiv                                        | Empfohlen            |
|-------------------|--------------------------|----------------------------------------------|----------------------|
| ✅ `hero.jpg` + `hero.webp`, `hero-1200.*`, `hero-mobile.*` | 01 / Hero | Sheep vor dem Turm | **erledigt** |
| ✅ `welcome.*`, `welcome-1200.*`, `welcome-mobile.*` | 02 / Welcome to the farm | Schäfer öffnet das Tor | **erledigt** |
| ✅ `flock.*`, `flock-1200.*`, `flock-mobile.*` | 03 / Life in the flock | Schäfer im Futterstall | **erledigt** |
| ✅ `sheep-wall.*`, `sheep-wall-1000.*`, `sheep-wall-mobile.*` | 04 / Meet Sheep | Sheep sprüht „BAAAAAHN THE SYSTEM" | **erledigt** |
| ✅ `studio.*`, `studio-1000.*`, `studio-mobile.*` | 05 / Sheep Records | Sheep am Studio-Schuppen | **erledigt** |
| ✅ `gate.*`, `gate-1200.*`, `gate-mobile.*` | 06 / The other side | Sheep am Tor, Blick nach SOLANGELES | **erledigt** |
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
`welcome.png`, `flock.png`, `sheep-wall.png`, `studio.png`, `gate.png`) und werden von der Seite **nicht** geladen. Daraus erzeugt sind:

* `hero.jpg` / `hero.webp` — volle Breite (1672 px) für große Screens
* `hero-1200.jpg` / `.webp` — für mittlere Screens
* `hero-mobile.jpg` / `.webp` — eigener Hochkant-Ausschnitt fürs Handy,
  auf Sheep zentriert (600 × 941)

Eingebunden über `<picture>`: der Browser lädt genau eine Fassung — WebP, wenn
er es kann. Auf dem Handy sind das **62 KB statt 2,4 MB**.

Neue Fassungen erzeugen (falls das Original mal ausgetauscht wird): siehe die
Größen oben, JPEG Qualität 80 / WebP 78.
