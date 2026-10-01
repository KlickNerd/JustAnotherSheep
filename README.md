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

## Collaboration Rules

Use `main` as the stable branch and make changes on feature branches for review.
Do not commit credentials, tokens, secrets, local environment files, or generated
build output.

**Do not regenerate or reinterpret canonical JAS character art without approval.**