# JHONNY AI — Phase 20 Deployment and Recovery (Updated 2026-10-10)

## Status
**BLOCKED / NOT READY for release validation.** The working source is at `/mnt/data/jhonny-ai-phase19` in the current Linux environment. It is an extracted copy of the supplied project, not a live connection to the user's Windows filesystem.

`npm config get registry` is correctly set to `https://registry.npmjs.org/`, but `npm ping` returns `EAI_AGAIN`, and OS-level name resolution returns `Temporary failure in name resolution`. No proxy environment variables are configured. An install retry timed out. No `node_modules` or lockfile was created.

## Retry when DNS/network is restored
Run from the project root in PowerShell or a terminal with Node.js >= 22.12.0 and npm >= 10:

```powershell
npm config get registry
Resolve-DnsName registry.npmjs.org
npm ping
npm install --no-audit --no-fund
npm ci
npm test
npm run typecheck
npm run lint
npm run build
python -m pytest backend/tests -q
python -m compileall -q backend/app backend/tests
```

`npm ci` should only be used after a genuine `package-lock.json` has been generated and checked into the project. Do not fabricate a lockfile or claim reproducibility until a clean `npm ci` succeeds.

## Existing Windows local setup
Use the existing Phase 19 Windows setup/deployment instructions for backend setup, environment variables, FFmpeg/FFprobe, and local frontend/backend startup. Do not expose the Vite development server publicly. Configure real secrets and production CORS before deployment.

## Data and packaging
Keep `.env` secrets, production databases, user uploads and rendered private media out of shared archives. Preserve `.env.example` placeholders. The supplied project archive's database had previously been reported as empty; this is not a guarantee about any separate Windows/local database.
