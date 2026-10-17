# PEACEHOLD (Game)

Das Browser-Spiel "Just Another Sheep: PEACEHOLD". Läuft als **eigener Cloudflare Worker** (`peacehold-game`) und ist bewusst von der Website getrennt: Änderungen hier dürfen die Website nicht beeinflussen und umgekehrt.

## Struktur

- `public/`: alles, was ausgeliefert wird (aktuell eine einzelne `index.html`)
- `wrangler.jsonc`: Worker-Konfiguration, statische Assets aus `public/`

## Deployment

Cloudflare Workers Builds, verbunden mit diesem Repo:

- Root-Verzeichnis: `game`
- Build-Befehl: leer
- Deploy-Befehl: `npx wrangler deploy`
- Build Watch Paths: `game/*`

Der Website-Worker (`justanothersheep`, Repo-Root) sollte `game/*` in seinen Build Watch Paths ausschließen.

## Lokal testen

```bash
cd game
npx wrangler dev
```
