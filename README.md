# Just Another Sheep

Source-controlled migration of the published Just Another Sheep experience.
This project preserves the live site as the visual reference. It is a migration,
not a redesign.

## Checkpoint Status

The React/Vite scaffold, shared visual tokens, global header/menu/footer, homepage,
character recovery, informational pages, archive pages, community pages, and route
views are implemented against the approved primary reference.

Canonical imagery is currently loaded from the published reference site so visual
comparison uses the existing source art. Local asset copying remains a follow-up
before production deployment.

## Local Setup

```bash
npm install
npm run dev
```

Build with `npm run build` and preview the production output with `npm run preview`.

## Route Map

Implemented routes include:

- `/start-here`
- `/episodes` and `/episodes/001-voluntary-assembly`
- `/files`
- `/watch`
- `/sounds`
- `/meet-the-flock` and individual character records
- `/peacehold`
- `/open-field` and discussion threads
- `/notebook` and Notebook entries
- `/about`

Future episode records beyond the approved Episode 001 source remain reserved
until their primary-reference content is available.

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

2. Make changes; run `npm install` if dependencies need installing, then
	`npm run dev` for local review and `npm run build` before committing.
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

The approved character identities and explicit image mappings in
`src/data/characters.js`, artwork under `public/images/characters/`, and core
brand assets under `public/images/brand/` require explicit owner review before
changes. CODEOWNERS also flags shared layout/navigation (`src/main.jsx`), global
styles, and collaboration guidance for review by `@LanceMeacham`. These areas
are review-sensitive, not technically locked against legitimate approved changes.

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