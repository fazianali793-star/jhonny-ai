# JHONNY AI — Phase 17 Deployment and Windows Setup

## Requirements

- Python 3.11 or newer (verified here with Python 3.13.5).
- Node.js compatible with the Vite version in `package.json` (verified here with Node 22.16.0) and npm.
- FFmpeg and FFprobe on `PATH` for upload metadata validation and rendering.
- Network access to the configured npm registry for frontend dependency installation. The current verification environment could not resolve `registry.npmjs.org` (`EAI_AGAIN`).

## Install and configure

From the extracted project root in PowerShell:

```powershell
Copy-Item .env.example .env
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
npm install
```

There is currently no package-manager lockfile in this archive. Do not run `npm ci` until a valid lockfile has been generated and reviewed in a network-enabled environment.

Set local development environment values in the shell:

```powershell
$env:JHONNY_DATA_DIR = (Join-Path (Get-Location) 'backend\data')
$env:JHONNY_DB_PATH = (Join-Path (Get-Location) 'backend\data\jhonny.sqlite3')
$env:JHONNY_CORS_ORIGINS = 'http://localhost:3000,http://127.0.0.1:3000'
```

Start the backend in the first terminal:

```powershell
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
```

Start the frontend in a second terminal from the project root:

```powershell
npm run dev
```

Open `http://127.0.0.1:3000`. The health endpoint is `http://127.0.0.1:8000/api/health`.

## Database

The current backend initializes SQLite tables and applies a lightweight forward migration at startup. Back up the configured SQLite file before upgrades. For production, introduce versioned migrations, a tested backup/restore process, persistent private media storage, and restricted filesystem permissions before deployment.

## Verification commands

```powershell
python -m compileall -q backend\app backend\tests
python -m pytest backend\tests -q
npm test
npm run typecheck
npm run lint
npm run build
```

The last four commands were blocked in the Phase 17 verification environment because frontend dependencies could not be installed. Run them after a successful `npm install` and report actual results.

## Production cautions

- Terminate TLS at a trusted HTTPS reverse proxy and set CORS to exact production origins.
- Keep backend secrets and environment files out of version control; frontend `VITE_*` values are public build-time values, not secret storage.
- Use a durable render queue and worker isolation for production rather than relying on in-process background tasks.
- Configure upload/request limits, CPU and memory limits, logging/monitoring, backup/restore, malware scanning, and operational alerting.
- Password reset email, payment/payout processing, and AI analysis providers are not operational until their services are configured and tested.
- Do not claim deployment is secured until these settings have been validated on the actual target environment.
