# JHONNY AI — Phase 18 Deployment Notes

## Runtime
- Python 3.10+ is expected by the current FastAPI/Pydantic code; use a supported Python release compatible with `backend/requirements.txt`.
- Node.js/npm versions should follow the frontend toolchain requirements. The project archive currently has no package lockfile, so reproducible frontend dependency resolution is not yet established.
- FFmpeg and FFprobe must be installed separately and available on `PATH` for upload inspection and rendering.

## Windows local setup
From the extracted project root, in PowerShell:

```powershell
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
$env:JHONNY_DATA_DIR = (Join-Path (Get-Location) 'backend\data')
$env:JHONNY_DB_PATH = (Join-Path (Get-Location) 'backend\data\jhonny.sqlite3')
$env:JHONNY_CORS_ORIGINS = 'http://localhost:3000,http://127.0.0.1:3000'
uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
```

In a second terminal after npm registry access is available:

```powershell
npm install
npm run dev
```

Open `http://127.0.0.1:3000`. Configure `VITE_API_BASE_URL` only as a frontend public API base URL; never put secrets in Vite-exposed variables.

## Database and backup
- The application initializes/forwards a small SQLite schema at backend startup. Back up the database only after stopping writes or using SQLite's supported backup mechanism.
- Keep database and media directories private and outside the public frontend/static directory.
- Restore instructions are environment-specific; a restore drill was not performed for this phase. Do not treat backup documentation as proof of recovery.

## Production cautions
- Deploy behind HTTPS, set exact trusted CORS origins, use least-privilege filesystem permissions, secure secrets outside source control, and apply request-size/time/resource limits at the reverse proxy.
- Add operational backups, monitoring, malware scanning, and a durable render queue before public production workloads.
- Do not expose this single-process development setup directly to the public internet.
