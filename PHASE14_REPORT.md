# JHONNY AI — Phase 14 Report

## Source verification and initial state

- Source of truth was the delivered `/mnt/data/jhonny-ai-phase13.zip`; `unzip -t` passed. The ZIP root folder is named `jhonny-ai-phase12/`, but it contains the Phase 13 report and setup guide, download-history API/test, and Phase 13 frontend changes described below.
- The archive contains no `.git` metadata, so Git status/diff could not be used to inspect user working-tree changes.
- `package.json` declares Vite/React/TypeScript and scripts for test, typecheck, lint, and build. No npm lockfile or `node_modules` was present. No Playwright/Cypress E2E setup was found.
- Node `v22.16.0`, npm `10.9.2`; registry `https://registry.npmjs.org/`.
- `npm view tsx version --fetch-retries=0 --fetch-timeout=5000` failed with `EAI_AGAIN` resolving `registry.npmjs.org`. `npm install --ignore-scripts --no-audit --no-fund --fetch-retries=0 --fetch-timeout=5000` timed out in the execution environment; it did not create `node_modules` or `package-lock.json`.

## Phase 14 code changes

### `backend/app/main.py`

- Added canonical UTC normalization for license expiry timestamps. Admin license updates now validate ISO-8601 expiry input, normalize timezone-aware timestamps to UTC, and return HTTP 400 for malformed values.
- Added instant-based expiry evaluation rather than relying on string comparison in clip detail, download, and moderation approval paths. Malformed legacy timestamps fail closed as expired.
- Added a startup migration that normalizes existing non-null license expiries into UTC. Malformed legacy values are moved to a past timestamp so they cannot accidentally authorize a download/public listing.
- Existing SQL-based public listing expiry filters now operate on normalized values. Existing authentication, role checks, publication rules, media-path containment checks, and license-use/platform restrictions remain in place.

### `backend/tests/test_api.py`

- Added regression coverage for revoked licenses, disallowed requested use, restricted platforms, timezone-offset normalization, and invalid expiry input.
- Existing Phase 13 test continues to cover unauthenticated and cross-user download-history access.

### Documentation

- Added `PHASE14_REPORT.md` and `PHASE14_SETUP_WINDOWS.md`.
- Updated `README.md` with Phase 14 security and verification status.

## Actual verification results

| Command/check | Result |
|---|---|
| `unzip -t /mnt/data/jhonny-ai-phase13.zip` | Passed; no ZIP errors |
| `node --version` / `npm --version` | `v22.16.0` / `10.9.2` |
| `npm view tsx version --fetch-retries=0 --fetch-timeout=5000` | Blocked: DNS `EAI_AGAIN` resolving `registry.npmjs.org` |
| `npm install --ignore-scripts --no-audit --no-fund --fetch-retries=0 --fetch-timeout=5000` | Timed out in the execution environment; no lockfile or `node_modules` produced |
| `npm test` | Failed before test execution: all 7 test files could not load because package `tsx` is unavailable; 0 tests passed |
| `npm run typecheck` | Blocked before checking source: TS2688 missing type definitions `node` and `vite/client` |
| `npm run lint` | Failed to launch ESLint (`eslint: Permission denied` in this environment); dependency install unavailable |
| `npm run build` | Failed to launch Vite (`vite: Permission denied` in this environment); dependency install unavailable |
| `node` with globally installed TypeScript 5.8.3 `transpileModule` over `src` and `tests` | 74 TS/TSX files transpiled; 0 syntax diagnostics. This is **not** a full type-check or build |
| `python -m compileall -q backend/app backend/tests` | Passed |
| `PYTHONPATH=backend python -m pytest backend/tests -q -ra` | **25 passed in 6.29s**, no failures or skips in the final run |
| FastAPI `TestClient` `GET /api/health` | **HTTP 200**, `{'status':'ok','service':'jhonny-ai-api','version':'8.0.0'}` |
| Browser E2E | Not run: frontend dependencies and browser E2E framework are not available; no live browser frontend could be launched |

## Security verification performed

- User download history requires a valid session and filters by authenticated server-side user ID; regression test checks a second user receives no first-user rows.
- Existing regression coverage checks unauthenticated/admin access, self-assigned privileged roles, project ownership, render-job ownership, unpublished and removed clips, expired licenses, missing media, traversal-like storage names, and public-library filtering.
- Phase 14 added direct tests for revoked licenses, non-permitted use, restricted platform, expiry timezone normalization, and invalid timestamps.
- Download authorization remains server-side: authentication, `Published` status, `Active` license, non-expired license, permitted use, platform restrictions, and a contained existing media file are checked before sending the file.
- Admin license/moderation operations still require the server-side admin dependency. Creator/project ownership checks were not weakened.
- Security tests are automated backend tests, not an independent penetration test. Production HTTPS, secret rotation, malware scanning, persistent job queues, backup/restore, monitoring, and multi-instance rate-limit coordination remain deployment work.

## Environment configuration (names only)

- Frontend: `VITE_API_BASE_URL` (defaults in the API client to `http://127.0.0.1:8000`). Vite-exposed variables must never contain secrets.
- Backend: `JHONNY_DATA_DIR`, `JHONNY_DB_PATH`, `JHONNY_CORS_ORIGINS`, `MAX_UPLOAD_BYTES`, and `TOKEN_TTL_SECONDS`.
- One-time administrator bootstrap inputs: `JHONNY_ADMIN_EMAIL`, `JHONNY_ADMIN_PASSWORD`, and `JHONNY_ADMIN_NAME`; use only for the trusted bootstrap process.
- `JHONNY_TOKEN_SECRET` appears in the example environment, but current authentication uses opaque random bearer tokens with only token hashes stored in the database; the variable is not used by that flow. Do not assume it provides signing or encryption.
- No secret values are included in the report or release archive.

## Frontend integration status

The Phase 13 production paths for live clip browsing, clip detail links, authenticated download history, and live creator submissions were present in the actual source. The API client contains matching helpers for auth, clips, projects, renders, downloads, and admin actions. Phase 14 did not claim further UI integrations as verified because dependencies could not be installed and a full type-check/build/browser run was blocked. Do not infer browser-level correctness from the syntax-only transpile.

## Remaining limitations

- Saved clips and account preferences have no server persistence endpoints.
- Creator-specific license listing endpoint is absent; creator earnings, payouts, banking/tax integration are not implemented.
- Creator upload/edit workflows are not fully migrated to production UI despite backend upload API availability.
- Creator/category directory search is unsupported by current routes.
- Studio advanced editing is partially migrated; real project persistence and FFmpeg render endpoints exist, but browser workflows were not verified in this phase.
- Admin AI clip analysis remains a prototype without a configured video-understanding service.
- Password reset remains unavailable without a secure token reset flow and configured email delivery.
- Frontend unit tests, full TypeScript typecheck, ESLint, production build, and browser E2E remain blocked/not verified.

## Release assessment

**Production readiness has not been established.** Backend tests and compilation pass, but frontend dependencies could not be installed and the full frontend validation and browser workflows remain unverified.
