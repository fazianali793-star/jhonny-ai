# JHONNY AI — Windows PowerShell Setup (Phase 14)

Run commands from the extracted project root (the directory containing `package.json`, `backend`, and `src`). Requirements: Python 3.11+, Node.js 22.12+ with npm 10+, and FFmpeg/FFprobe on `PATH` for actual video upload/render workflows.

## 1. Backend

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

Keep the backend terminal open. For deployment, use HTTPS, configure exact trusted CORS origins, use a unique random token secret if/when token signing is configured, and never commit `.env` files or credentials.

## 2. Frontend dependencies and checks

```powershell
node --version
npm --version
npm config get registry
npm install
npm test
npm run typecheck
npm run lint
npm run build
```

The delivered source does not include a lockfile: npm dependency resolution could not complete in the implementation environment. This is a known reproducibility gap. If `npm install` succeeds on a trusted network, review and retain the generated `package-lock.json`; use `npm ci` for subsequent clean installs. Do not fabricate a lockfile or disable TLS verification.

Start Vite only after the dependencies are installed:

```powershell
npm run dev
```

The configured dev server binds to `127.0.0.1:3000`. Set `VITE_API_BASE_URL` in `.env.local` if the API is hosted elsewhere; do not use a public production secret in any `VITE_` variable.

## 3. Backend verification

From the project root, with the virtual environment activated:

```powershell
python -m compileall -q backend\app backend\tests
$env:PYTHONPATH = 'backend'
python -m pytest backend\tests -q -ra
```

For real upload/render testing, install FFmpeg and FFprobe and confirm both commands are on `PATH`.

## 4. If npm fails

If you see `EAI_AGAIN`, `ENOTFOUND`, or `ETIMEDOUT`, check approved DNS/network/proxy configuration with your administrator and retry the npm registry probe. If scripts report missing packages or fail to launch, do not treat tests/typecheck/lint/build as passed. Browser E2E requires a working frontend install and a browser automation framework; none is configured in this archive.

## 5. Known product limitations

Saved clips/account preferences persistence, creator-scoped license listing, creator earnings/payouts, creator/category directory search, password reset email, and real AI clip analysis are not fully implemented server features. Advanced Studio UI is partially migrated. These must not be represented as production-ready until implemented and tested.
