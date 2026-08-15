# Audio

Hier liegen die Tracks für den Player in Sektion 05 (Sheep Records).

| Datei        | Titel | Verwendung |
|--------------|-------|------------|
| `seven.mp3`  | Seven | Release 001, Player auf der Startseite |

## Anforderungen

* **Format:** MP3, 160–192 kbps, mono-kompatibel (viele hören auf dem
  Handylautsprecher). Zielgröße: unter 4 MB.
* **Lautheit:** ca. **−14 LUFS integriert**, True Peak −1 dBTP. Lauter
  gemastert klingt neben den ruhigen Bildern aufdringlich.
* **Länge:** 2:30–3:00.
* Die Datei wird **erst geladen, wenn jemand auf Play drückt** — sie zählt
  also nicht in das Ladebudget der Seite.

Titel und Dateiname stehen in `index.html` am Element `.player`
(`data-src`, `data-title`) und im Text darüber (`.player__title`).
Fehlt die Datei, schaltet der Player automatisch in den Hinweiszustand.
