# JHONNY AI — Windows PowerShell Setup (Phase 12)

## Requirements

- Python 3.11 or newer
- Node.js 22.12 or newer and npm 10+
- FFmpeg and FFprobe installed and available on `PATH` for actual media upload/render workflows
- Approved network access to the configured npm registry for frontend dependency installation

Extract the ZIP and open PowerShell in the extracted `jhonny-ai-phase11` directory (or the directory name you chose when extracting).

## Backend setup

```powershell
Copy-Item .env.example .env -Force
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
New-Item -ItemType Directory -Force backend\data | Out-Null
$env:JHONNY_DATA_DIR = (Join-Path (Get-Location) 'backend\data')
$env:JHONNY_DB_PATH = (Join-Path (Get-Location) 'backend\data\jhonny.sqlite3')
$env:JHONNY_CORS_ORIGINS = 'http://localhost:3000,http://127.0.0.1:3000'
uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
```

Keep this terminal open. Use a second terminal for the frontend.

## Frontend setup

```powershell
node --version
npm --version
npm config get registry
npm install
```

This source package intentionally does not include a lockfile because dependency resolution has not completed in the build environment. After `npm install` succeeds in an approved network environment, review the generated `package-lock.json` and keep it with the source; subsequent clean installs can use `npm ci`.

Start Vite:

```powershell
npm run dev
```

Open the local URL printed by Vite (the configured port is 3000). The development server binds to loopback.

## Verification commands

Run from the project root after installation succeeds:

```powershell
python -m pytest backend\tests -q -ra
python -m compileall -q backend\app backend\tests
npm test
npm run typecheck
npm run lint
npm run build
```

`npm test` uses Node's test runner and `tsx`. `npm run typecheck` runs `tsc --noEmit`. `npm run lint` runs ESLint with the repository flat config. `npm run build` runs `vite build`. Do not treat syntax-only transpilation as a successful type-check or build.

## If npm registry access fails

Check the exact error with:

```powershell
npm config get registry
npm view tsx version --fetch-retries=0 --fetch-timeout=10000
```

For errors such as `EAI_AGAIN`, `ENOTFOUND`, or `ETIMEDOUT`, verify DNS/network access and approved proxy/registry configuration with your network administrator. Do not disable TLS verification, change to an unapproved registry, or bypass network restrictions. Preserve `package.json`; do not hand-write or fabricate a lockfile. Run backend tests and available offline syntax checks while dependency installation is blocked.

## Environment and administrator bootstrap

Copy `.env.example` as a local starting point only. Do not commit credentials. If you intentionally bootstrap an administrator, follow `backend/app/bootstrap_admin.py` and provide a unique strong password through environment variables in a private terminal. Do not put credentials in source control or reports.

## Production limitations

The local setup binds to loopback and is not a production deployment recipe. Configure and test HTTPS, trusted proxy handling, backups/restore, monitoring, malware scanning, and a durable render queue separately. Render jobs currently run in-process and may be lost on server restart. Password reset requires a configured token workflow and email provider; no email is sent by the current UI.
