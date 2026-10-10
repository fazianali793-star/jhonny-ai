# JHONNY AI — Phase 17 Source Audit

## Scope and reproducibility

- Input archive: `jhonny-ai-phase16.zip`; extracted and inspected before editing.
- Phase 16 reports and README were read, but this audit treats the archive's code and rerun checks as authoritative.
- Baseline before edits: `python -m pytest backend/tests -q` → **32 passed in 6.32s**.
- Runtime available in this environment: Node.js 22.16.0, npm 10.9.2, Python 3.13.5, global TypeScript 5.8.3, FFmpeg and FFprobe found on PATH.
- No `package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock` exists. `node_modules` is absent. Do not use `npm ci` until a valid reviewed lockfile exists.

## Architecture verified

- React 19 / TypeScript / Vite / Tailwind CSS 4 frontend; custom router in `src/router/Router.tsx`; shared API client in `src/lib/api.ts`; application state in `src/context/AppContext.tsx`.
- FastAPI backend in `backend/app/main.py`; SQLite with startup schema initialization and a lightweight forward migration; backend tests in `backend/tests/test_api.py`.
- Bearer sessions are opaque random tokens; only token hashes are stored in SQLite. Passwords use PBKDF2-HMAC-SHA256.
- Media uploads are stored in private backend data storage and inspected using FFprobe. FFmpeg renders are executed as in-process background tasks.

## Main API groups found

- Health: `GET /api/health`.
- Authentication: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`.
- Media: `POST /api/clips/upload`, `GET /api/clips`, `GET /api/clips/{clip_id}`, `GET /api/clips/{clip_id}/download`.
- Account: `GET /api/me/clips`, `GET /api/me/downloads`, `GET /api/me/licenses`.
- Admin: user role management, submission listing, moderation, licenses, analytics, reports, and moderation history.
- Studio: project create/list/update/duplicate/delete, render creation/status/download.

## Verified defects addressed in Phase 17

1. `/api/health` previously always returned success without checking whether the database was available. It now runs `SELECT 1`, returns a minimal database readiness indicator, and returns a generic HTTP 503 without leaking database errors.
2. Render status stayed at a fixed low percentage until completion. FFmpeg is now invoked with its progress protocol and persisted progress advances from actual media time. The API still only reports completed after a non-empty output file exists.
3. FFmpeg failure diagnostics could contain private absolute storage paths if copied directly into job errors. Non-zero FFmpeg exits now return a generic user-facing failure message instead of persisting stderr paths. Process timeout and cleanup are handled; output is removed on failure.
4. Added regression coverage for health/readiness behavior and for private FFmpeg paths not being persisted on render failure.

## Confirmed limitations / risks

- No frontend package lockfile is present, and registry DNS currently fails with `EAI_AGAIN`; dependency installation cannot be reproduced here.
- Full TypeScript type checking, frontend unit tests, ESLint, Vite production build, and browser E2E cannot complete without the missing frontend dependencies.
- The existing application retains legacy/demo views and mock-data modules. Not every dashboard, earnings, saved-clip, account-preference, and AI workflow is fully backed by the server. Do not interpret legacy metrics as verified backend accounting.
- Password recovery/email delivery is not operational; no reset-token/email provider implementation was found.
- Creator payouts/accounting and AI analysis are not operational integrations in this archive.
- Render jobs remain in-process and are not durable across server restarts or multiple workers.
- Production HTTPS, secret management, malware scanning, backup/restore, monitoring, external security testing, and deployment-specific storage permissions have not been validated.
- The backend test suite is automated regression coverage, not a penetration test.
