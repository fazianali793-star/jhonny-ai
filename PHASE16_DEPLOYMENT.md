# JHONNY AI — Phase 16 Setup & Deployment Notes

## Required software

- Python 3.11 or newer (use a version supported by the pinned backend dependency range).
- Node.js 22 recommended for the configured Vite 8 toolchain, plus npm 10 or compatible.
- FFmpeg and FFprobe on `PATH` for real upload metadata extraction and Studio MP4 rendering.
- Network access to the configured/approved npm registry for frontend dependencies. Do not disable TLS verification or bypass network restrictions.

## Windows local setup

Extract `jhonny-ai-phase16.zip`. Open PowerShell in the extracted project root.

### Backend terminal

```powershell
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
$env:JHONNY_DATA_DIR = (Join-Path (Get-Location) 'backend\data')
$env:JHONNY_DB_PATH = (Join-Path (Get-Location) 'backend\data\jhonny.sqlite3')
$env:JHONNY_CORS_ORIGINS = 'http://localhost:3000,http://127.0.0.1:3000'
$env:MAX_UPLOAD_BYTES = '524288000'
$env:TOKEN_TTL_SECONDS = '3600'
uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
```

The backend creates its SQLite schema and private storage directories at startup. Data/media should live on a persistent disk and must not be placed under a publicly served frontend directory. The source archive does not include a live database or uploaded media.

### Frontend terminal

```powershell
npm install
npm test
npm run typecheck
npm run lint
npm run build
npm run dev
```

Open `http://127.0.0.1:3000`. Set `VITE_API_BASE_URL` before Vite starts if the API runs at another local address. Vite-exposed `VITE_` variables are public client configuration; never put secrets in them.

## Environment variables

- `VITE_API_BASE_URL`: frontend API origin; defaults to `http://127.0.0.1:8000`.
- `JHONNY_DATA_DIR`: private persistent application data directory.
- `JHONNY_DB_PATH`: SQLite database file path.
- `JHONNY_CORS_ORIGINS`: comma-separated exact browser origins. Configure only the deployment's intended origins.
- `MAX_UPLOAD_BYTES`: maximum streamed upload size; default is 524288000 bytes.
- `TOKEN_TTL_SECONDS`: bearer session expiry; default is 3600 seconds.
- `JHONNY_MAX_ACTIVE_RENDERS`: in-process render concurrency cap; default is 2.
- `JHONNY_ADMIN_EMAIL`, `JHONNY_ADMIN_PASSWORD`, `JHONNY_ADMIN_NAME`: only for one-time trusted operator bootstrap via `python -m app.bootstrap_admin` with `PYTHONPATH=backend` or equivalent module path. Use a unique password of at least 16 characters; unset credentials after bootstrap. Never commit actual credentials.

The current session system uses opaque random bearer tokens and stores only SHA-256 token hashes in SQLite. `JHONNY_TOKEN_SECRET` is not used for signing/encryption and should not be relied on. Session revocation is done through logout/session database operations, not secret rotation.

## API and behavior notes

- API health: `GET http://127.0.0.1:8000/api/health`.
- Interactive development docs: `http://127.0.0.1:8000/docs`; do not expose these publicly without a deliberate deployment policy.
- New creator submissions endpoint: `GET /api/me/clips`, requiring creator/admin role and scoping records to the authenticated account.
- Public clip list/detail/download authorization is enforced in FastAPI. UI state does not grant rights.
- Admin account bootstrap is a separate trusted operation; public registration cannot create creator/admin accounts.

## Production requirements not established by this project package

Before public deployment, use HTTPS/TLS at a trusted reverse proxy, a production database migration/backup strategy, a durable render queue, file retention/cleanup policies, private storage permissions, malware/content scanning, structured operational logging, monitoring/alerts, tested backup restore, dependency vulnerability scanning, and rate-limit coordination if multiple API workers/instances are used. Avoid trusting arbitrary forwarded-IP headers. Run behind an appropriately configured production ASGI server and restrict admin bootstrap access.

Password recovery remains unavailable until a secure single-use expiring reset-token flow and a configured email delivery service are implemented. Creator earnings/payouts remain unavailable without real accounting/payment integrations. AI video analysis is not operational without a configured provider and verified analysis pipeline. The frontend production build and browser E2E suite must be run after npm dependency installation succeeds.
