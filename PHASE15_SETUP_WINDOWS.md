# JHONNY AI — Phase 15 Windows Setup

This guide applies to the Phase 15 source archive. It continues the existing React 19/Vite frontend and FastAPI backend; it does not replace the application.

## Requirements

- Windows 10/11, PowerShell
- Python 3.11 or newer
- Node.js 22.12+ and npm 10+
- FFmpeg and FFprobe available on `PATH` for real upload/render workflows
- Network access to the configured npm registry for frontend dependency installation

## Backend setup

Run from the extracted project root (the folder containing `package.json` and `backend`):

```powershell
Copy-Item .env.example .env -ErrorAction SilentlyContinue
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
New-Item -ItemType Directory -Force backend\data | Out-Null
$env:JHONNY_DATA_DIR = (Join-Path (Get-Location) 'backend\data')
$env:JHONNY_DB_PATH = (Join-Path (Get-Location) 'backend\data\jhonny.sqlite3')
$env:JHONNY_CORS_ORIGINS = 'http://localhost:3000,http://127.0.0.1:3000'
uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
```

Keep this terminal open. Check `http://127.0.0.1:8000/api/health`.

## Frontend setup

Open a second PowerShell terminal in the same project root:

```powershell
node --version
npm --version
npm config get registry
npm install
npm run dev
```

Open the local URL printed by Vite (the project config uses port 3000). The source archive does not contain a lockfile because registry access was unavailable during verification. Once a normal approved `npm install` succeeds, review and commit the generated `package-lock.json`; use `npm ci` for repeatable installs thereafter. Do not disable TLS verification or bypass network restrictions to install dependencies.

## Verification commands

From the project root:

```powershell
python -m pytest backend\tests -q -ra
python -m compileall -q backend\app backend\tests
npm test
npm run typecheck
npm run lint
npm run build
```

The TypeScript syntax-only check mentioned in the report is not equivalent to `npm run typecheck` or `npm run build`.

## Environment variables

- `VITE_API_BASE_URL`: frontend API base URL; never put secrets in `VITE_` variables.
- `JHONNY_DATA_DIR`, `JHONNY_DB_PATH`: private backend data/database locations.
- `JHONNY_CORS_ORIGINS`: comma-separated exact frontend origins.
- `MAX_UPLOAD_BYTES`: maximum upload size in bytes.
- `TOKEN_TTL_SECONDS`: session lifetime in seconds.
- `JHONNY_ADMIN_EMAIL`, `JHONNY_ADMIN_PASSWORD`, `JHONNY_ADMIN_NAME`: only for the trusted one-time admin bootstrap flow; never commit real values.

## Current limitations and deployment notes

- The creator-scoped license endpoint is now backed by the database and returns only the authenticated creator's clip licenses.
- Password reset is not operational: no configured secure token-reset flow and email provider are present.
- Creator earnings/payouts and payment/banking integrations are not real accounting services.
- AI video analysis is not enabled unless a real analysis provider is configured; development ingestion must not be presented as completed AI analysis.
- Render jobs are in-process FastAPI background tasks, not a durable queue. A process restart can interrupt work.
- Browser end-to-end verification was not possible in the verification environment because npm dependencies could not be installed and no browser test framework was present.
- Before internet-facing production deployment, configure HTTPS, secret management/rotation, malware scanning, backups/restore drills, monitoring, storage permissions, rate limiting appropriate to the deployment, and a durable job queue.
