# JHONNY AI — Phase 19 Deployment and Recovery

## Requirements
- Python compatible with `backend/requirements.txt` (Python 3.11+ recommended).
- Node.js >= 22.12.0 and npm >= 10.0.0, as declared in `package.json`.
- FFmpeg and FFprobe on `PATH` for upload inspection and Studio rendering.
- Network access to the configured npm registry for frontend dependency installation. The Phase 19 build environment could not resolve `registry.npmjs.org` (`EAI_AGAIN`).

## Windows local setup
From the extracted project root in PowerShell:

```powershell
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
npm install
npm test
npm run typecheck
npm run lint
npm run build
```

Do not deploy until npm install succeeds and the checks above are reviewed. Since no lockfile is included, dependency versions are not yet fully reproducible. After registry access is restored, resolve dependencies using the project's npm manifest and commit the generated `package-lock.json` only after successful install and verification.

Start backend in a separate PowerShell terminal:

```powershell
$env:JHONNY_DATA_DIR = (Join-Path (Get-Location) 'backend\data')
$env:JHONNY_DB_PATH = (Join-Path (Get-Location) 'backend\data\jhonny.sqlite3')
$env:JHONNY_CORS_ORIGINS = 'http://localhost:3000,http://127.0.0.1:3000'
uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
```

Then run `npm run dev` from the project root and open `http://127.0.0.1:3000`.

## Data safety
Keep `.env` files, database files, and media storage private and out of the frontend root. Use HTTPS, strict CORS, backup/restore drills, monitoring, malware scanning, and a durable render queue before public production use. No backup restoration or production deployment was tested in this phase.
