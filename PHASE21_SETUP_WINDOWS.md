# JHONNY AI — Phase 21 Windows Setup and Verification

## Requirements

- Node.js compatible with `package.json` (Node.js 22.16.0 was used for this verification)
- Python 3.11+
- FFmpeg/FFprobe installed and on `PATH` for video upload/render workflows
- DNS/network access to the configured npm registry for first-time frontend dependency installation

## 1. Diagnose npm registry DNS

Run in PowerShell from the project root:

```powershell
node --version
npm --version
npm config get registry
Resolve-DnsName registry.npmjs.org
npm ping --fetch-retries=0 --fetch-timeout=15000
```

The Phase 21 verification environment received `EAI_AGAIN` and Python name-resolution errors for `registry.npmjs.org`. Do not disable TLS verification or bypass company/network policy. If DNS resolution fails on your machine too, check the approved network/VPN/DNS settings with your administrator.

## 2. Install frontend dependencies after DNS works

The supplied archive does not contain a lockfile or `node_modules`. Do not use `npm ci` until a real `package-lock.json` has been created by npm.

```powershell
npm install --no-audit --no-fund
# Review and commit/package the generated package-lock.json.
# On later clean installs:
npm ci
npm test
npm run typecheck
npm run lint
npm run build
```

## 3. Install and test the backend

```powershell
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
$env:JHONNY_DATA_DIR = (Join-Path (Get-Location) 'backend\data')
$env:JHONNY_DB_PATH = (Join-Path (Get-Location) 'backend\data\jhonny.sqlite3')
$env:JHONNY_CORS_ORIGINS = 'http://localhost:3000,http://127.0.0.1:3000'
$env:PYTHONPATH = (Join-Path (Get-Location) 'backend')
python -m pytest backend\tests -q -ra
python -m compileall -q backend\app backend\tests
```

## 4. Start the app locally

Backend terminal (project root, virtual environment activated):

```powershell
uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
```

Second terminal, project root:

```powershell
npm run dev
```

Open `http://localhost:3000`. Keep local development servers bound to loopback; do not expose Vite directly to the public internet.

## Phase 21 status

- Backend: 37 tests passed; Python compilation passed.
- Frontend: tests, full typecheck, lint, and build are blocked until dependencies install successfully.
- Browser E2E: not run.
