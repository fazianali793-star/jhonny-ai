# JHONNY AI — Windows PowerShell Setup (Phase 13)

Use PowerShell from the extracted project root (the directory containing `package.json`, `backend`, and `src`). Requirements: Python 3.11+, Node.js 22.12+ with npm 10+, and FFmpeg/FFprobe on `PATH` for actual video upload/render workflows.

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

Keep the backend terminal open. In another PowerShell window, change to the same project root for frontend commands.

## Frontend

```powershell
node --version
npm --version
npm config get registry
npm install
```

The delivered source does not include a lockfile because dependency resolution could not complete in the implementation environment. Do not treat that as an intentional reproducible install. Once `npm install` completes successfully in an approved network environment, review the generated `package-lock.json` and commit it; use `npm ci` for later clean installs.

```powershell
npm run dev
```

Open the local URL printed by Vite. The configured dev server binds to `127.0.0.1` on port 3000.

## Verification

```powershell
python -m pytest backend\tests -q -ra
python -m compileall -q backend\app backend\tests
npm test
npm run typecheck
npm run lint
npm run build
```

`npm test` uses Node's test runner and `tsx`; `typecheck` runs `tsc --noEmit`; `lint` invokes the repository's ESLint flat config; `build` runs `vite build`. A syntax-only TypeScript transpile is not a type-check or production build.

## If npm installation fails

Run `npm config get registry` and `npm view tsx version --fetch-retries=0 --fetch-timeout=10000`. For `EAI_AGAIN`, `ENOTFOUND`, or `ETIMEDOUT`, check approved DNS/network/proxy configuration with your network administrator. Do not disable TLS verification, bypass network restrictions, or fabricate a lockfile. Backend tests and Python compilation can still run offline.

## Current limitations

Saved clips, user profile preferences, creator-scoped license listings, creator earnings/payment, creator/category directory search, password reset email, and production AI clip analysis are not fully implemented server features. Their production pages identify the missing capability rather than presenting local/demo records as authoritative. Browser E2E, full frontend type-check, lint, and production build must be run after dependencies install successfully.
