# Audio

Hier liegen die Tracks für den Player in Sektion 05 (Sheep Records).

| Datei        | Titel | Verwendung |
|--------------|-------|------------|
| ✅ `seven.mp3` | Seven | Release 001, Player auf der Startseite — 2:46, 3,7 MB |

## Anforderungen

* **Format:** MP3, 160–192 kbps, mono-kompatibel (viele hören auf dem
  Handylautsprecher). Zielgröße: unter 4 MB.
* **Lautheit:** ca. **−14 LUFS integriert**, True Peak −1 dBTP. Lauter
  gemastert klingt neben den ruhigen Bildern aufdringlich.
* **Länge:** 2:30–3:00.
* Die Datei wird **erst geladen, wenn jemand auf Play drückt** — sie zählt
  also nicht in das Ladebudget der Seite.

## Texte und Prompts

`album.md` — Albumkonzept, Dramaturgie, Übersicht aller 14 Tracks.
`tracks/NN-titel.md` — pro Track: vollständiger Songtext, Suno-Prompt
(Style of Music, Exclude Styles, getaggte Lyrics) und Produktionsnotizen.

Titel und Dateiname stehen in `index.html` am Element `.player`
(`data-src`, `data-title`) und im Text darüber (`.player__title`).
Fehlt die Datei, schaltet der Player automatisch in den Hinweiszustand.

## Springen im Track

Der Player setzt `currentTime` — das funktioniert nur, wenn der Webserver
**Bereichsanfragen** (HTTP Range) beantwortet. GitHub Pages, Netlify, Vercel und
jeder normale Webserver tun das. Der eingebaute Python-Testserver
(`python3 -m http.server`) tut es **nicht**: Dort springt der Track auf 0:00
zurück. Das ist kein Fehler der Seite, sondern eine Einschränkung des Testservers.
