# Just Another Sheep

Statische Website von Just Another Sheep ("Don't follow. Belong.") plus das
PEACEHOLD-Browserspiel. Die frühere React/Vite-Seite wurde am 22.11.2026 durch
die neue Homepage ersetzt; sie liegt weiterhin in der Git-Historie.

## Website

Alles, was ausgeliefert wird, liegt in [`site/`](site/):

- `site/index.html`: die komplette Homepage (HTML, CSS und JS in einer Datei)
- `site/assets/`: Illustrationen (WebP), Logo und Headline-Lettering (SVG)
- `site/audio/`: der Song "The Flock". Startet mit der Seite bzw. beim ersten Klick
  (Browser blockieren Ton ohne Interaktion), steuerbar über den Button unten rechts
  und den Player bei "The Music"
- `site/fonts/`: JAS Brush, Caveat Brush, Barlow (SIL Open Font License, lokal eingebunden)
- `site/404.html`: leitet unbekannte Pfade auf die Startseite
- `site/peacehold-game/` und `site/images/`: die Spiel-Demo unter `/peacehold-game/`
  mit ihren Bildern, unverändert aus der alten Seite übernommen

### Vor dem Launch eintragen

Ganz unten in `site/index.html`, im Block `const JAS = { ... }`:

- `ca`: Contract Address von $BAAAH
- `links.x`, `links.telegram`, `links.discord`, `links.youtube`
- `links.buy` (Swap/Launchpad) und `links.chart`

Solange etwas fehlt, zeigt die Seite unten links einen gelben Setup-Hinweis.
Die Buttons "GET $BAAAH" und "SEE THE CHART" erscheinen erst, wenn ihre Links
gesetzt sind.

### Build und Deployment

```bash
npm run build     # kopiert site/ nach dist/, kein Bundler
npm run preview   # Build plus lokaler Cloudflare-Worker (wrangler dev)
```

Cloudflare Workers (`wrangler.jsonc`) liefert `./dist` aus. In Workers Builds:
Build-Befehl `npm run build`, Deploy-Befehl `npx wrangler deploy`.

## Game

The PEACEHOLD browser game lives in [`game/`](game/README.md) and deploys as its
own Cloudflare Worker (`peacehold-game`). It is not part of the website build.
An older playable demo is still served by the website at `/peacehold-game/`.

## Collaboration Workflow

**Do not push directly to `main`.** `main` is the approved, stable baseline.
Use `feature/<name>` for features, `fix/<name>` for bugs, `content/<name>` for
episode/content additions, and `chore/<name>` for tooling, docs, and maintenance.
Examples: `feature/audio-player`, `feature/open-field-backend`,
`content/episode-002`, and `fix/mobile-hero-spacing`.

1. Clone the repository and create a branch from the latest `main`:

	```bash
	git clone https://github.com/LanceMeacham/Just-Another-Sheep.git
	cd Just-Another-Sheep
	git switch main
	git pull --ff-only origin main
	git switch -c feature/your-change
	```

2. Make changes in `site/`; open `site/index.html` in a browser for local
	review and run `npm run build` before committing.
3. Commit and push your branch with `git push -u origin HEAD`.
4. Open a pull request using the PR template. Include a summary, affected
	routes/components, build/test results, known limitations, and screenshots
	for visual changes. Explicitly disclose canonical asset or mapping changes.
5. Wait for review, address comments, and merge only after approval and passing
	checks. Ordinary collaborator changes require at least one approving review;
	new commits invalidate stale approvals and conversations must be resolved.

The PR build workflow runs `npm ci` and `npm run build`; it does not deploy.
Do not commit credentials, tokens, secrets, local environment files, or generated
build output. Use the Bug, Feature, or Content Update issue template to propose work.

### Canonical Areas

**Do not regenerate or reinterpret canonical JAS character art without approval.**
Artwork under `site/assets/` and `docs/style-guide/` requires owner review before
changes.

The intended `main` protections are PRs, one approval, code-owner review,
stale-review dismissal, conversation resolution, and strict `Build` status checks.
Force pushes and branch deletion should be blocked for collaborators; owner/admin
recovery can remain available.

**Enforcement gap:** GitHub rejected branch protection for this private repository
with HTTP 403, requiring GitHub Pro or public visibility. Direct pushes are not
technically blocked yet. The owner must choose a supported plan or explicitly
approve changing visibility before protections can be enabled. Keep the repository
private unless the owner authorizes otherwise. Templates, CODEOWNERS, and CI take
effect after this collaboration setup is reviewed and merged into `main`.