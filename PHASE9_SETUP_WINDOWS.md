# JHONNY AI — Windows PowerShell Setup (Phase 10)

## Requirements

- Python 3.11 or newer
- Node.js compatible with the Vite version in `package.json`
- FFmpeg and FFprobe installed and available on `PATH` for real video uploads/renders

Open PowerShell in the extracted `jhonny-ai-phase9` project directory.

## Backend

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

Keep that terminal open.

## Frontend

Open a second PowerShell terminal in the project root:

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite (the configured dev port is 3000). The provided Phase 8 archive has no package lockfile, so `npm install` resolves the ranges in `package.json` and may create a new local `package-lock.json`; do not treat that as a lockfile supplied by this archive.

## Verification

From the project root:

```powershell
python -m pytest backend\tests -q -ra
python -m compileall -q backend\app backend\tests
npm test
npm run typecheck
npm run lint
npm run build
```

`npm run lint` is configured as `tsc --noEmit`. These frontend commands require successful dependency installation. Do not report a failed or blocked command as passing.

## Admin bootstrap

Only if you deliberately need to initialize an administrator, configure `JHONNY_ADMIN_EMAIL` and `JHONNY_ADMIN_PASSWORD` as environment variables for the one-time bootstrap command, use a unique strong password, and do not commit real credentials. Follow the current `backend/app/bootstrap_admin.py` instructions. Do not put credentials in source control or share them in reports.

## Security/production notes

This setup binds the API to loopback for local development. It is not a production deployment recipe. Configure HTTPS, a trusted reverse proxy, backups, monitoring, malware scanning, and a durable render queue separately before production use. Render jobs currently run in-process and can be lost on server restart.


## Dependency installation troubleshooting

The supplied archive has no npm lockfile, so use `npm install` (not `npm ci`) to resolve the declared ranges. If it times out, preserve `package.json`, do not fabricate or hand-write a lockfile, and retry only after registry access is available. Do not disable TLS verification or bypass network controls. `npm run lint` currently aliases `tsc --noEmit`; it is not a separate ESLint pass because ESLint is not configured in this repository.
