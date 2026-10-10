# JHONNY AI — Phase 16 Source Audit

## Scope and source of truth

- Input archive: `jhonny-ai-phase15.zip`.
- The archive was extracted successfully and its source inspected before Phase 16 edits.
- The source root is `jhonny-ai-phase15/`; no Git metadata was present, so a Git diff against an original working tree was not available.
- Historical Phase 12, 13, 14 and 15 reports and README were read as context, but findings below are based on the source code and independently rerun checks.

## Actual architecture

- Frontend: React 19, TypeScript, Vite 8, Tailwind CSS 4, custom hash/history router, API client in `src/lib/api.ts`, app context in `src/context/AppContext.tsx`.
- Backend: FastAPI, SQLite, opaque random bearer tokens whose hashes are stored in SQLite, PBKDF2-HMAC-SHA256 password hashing, FFmpeg/FFprobe subprocesses, local private media storage.
- Backend entrypoint: `backend/app/main.py`; admin bootstrap helper: `backend/app/bootstrap_admin.py`; backend tests: `backend/tests/test_api.py`.
- Frontend package manager manifests: `package.json`; no `package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock` exists in the input archive. `node_modules` is absent.
- Backend dependencies are listed in `backend/requirements.txt`. No versioned migration framework is configured; database schema uses idempotent startup initialization and a lightweight migration.

## Existing API surface found

- Health: `GET /api/health`.
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`.
- Media: `POST /api/clips/upload`, `GET /api/clips`, `GET /api/clips/{clip_id}`, `GET /api/clips/{clip_id}/download`.
- User account data: `GET /api/me/downloads`, `GET /api/me/licenses` (creator/admin), and added in Phase 16 `GET /api/me/clips` (creator/admin).
- Admin: `PUT /api/admin/users/{user_id}/role`, `GET /api/admin/submissions`, `POST /api/admin/clips/{clip_id}/moderate`, `PUT /api/admin/clips/{clip_id}/license`, `GET /api/admin/analytics`, `GET /api/admin/users`, `GET /api/admin/creators`, `GET /api/admin/licenses`, `GET /api/admin/reports`, `POST /api/reports`, `PUT /api/admin/reports/{report_id}`, `GET /api/admin/moderation`.
- Studio/rendering: `POST /api/projects`, `GET /api/projects`, `PUT /api/projects/{project_id}`, `POST /api/projects/{project_id}/duplicate`, `DELETE /api/projects/{project_id}`, `POST /api/projects/{project_id}/renders`, `GET /api/renders/{job_id}`, `GET /api/renders/{job_id}/download`.

## Authentication and authorization observations

- Registration only permits role `user`; creator/admin roles cannot be self-selected.
- Sessions use random opaque bearer tokens, with SHA-256 token hashes persisted in SQLite and expiration enforced server-side. Password hashes use PBKDF2-HMAC-SHA256 with per-password salts.
- Admin and creator dependencies enforce role checks on the backend. Project operations check owner IDs server-side. Download history is scoped by authenticated user ID.
- `JHONNY_TOKEN_SECRET` was referenced by the Phase 14/15 documentation as though it were an operational secret, but the source auth flow does not use it; Phase 16 removes the unused variable from source/config guidance rather than imply it provides token signing or encryption.
- Password reset is deliberately unavailable and the existing page states no reset email is sent. There is no secure reset-token/email-delivery implementation.

## Media and rights observations

- Upload checks extension and MIME allowlists, limits streamed upload bytes, writes to a generated UUID filename in private media storage, then uses FFprobe to verify video metadata. FFprobe is bounded by a 30-second timeout.
- Public Library/detail routes require Published status and Active, unexpired license. Download additionally requires authentication, permitted requested use, no matching platform restriction, and a contained existing media path. A download history row is recorded in a response background task after media response sending.
- Render jobs check project/source ownership, trim bounds, output format and source metadata. The Phase 15 fix checks that a non-empty output exists before marking a render complete. Render work remains an in-process FastAPI background task and is not durable across restarts.
- Phase 15 included a creator-scoped license endpoint, FFprobe timeout and non-empty render-output verification. These changes were present in the archive.

## Phase 16 findings fixed

1. Creator submissions UI used `GET /api/clips` and filtered by owner in the browser. This could silently truncate creator submissions at the 100-item page limit and required the UI to receive records not specifically scoped to the account. Added server-side `GET /api/me/clips` with role checks, filters, pagination, an owner-scoped SQL query, and private storage/moderation fields removed from the response. Frontend creator submission panel now uses this endpoint.
2. Admin approval required an Active, unexpired license but did not revalidate the rights-verification note or legacy license permission data at approval time. Approval now fails closed if the rights evidence note is shorter than 10 characters or allowed-use data is invalid.
3. Admin could set a license to Active while its supplied expiry was already in the past. License activation now rejects already-expired expiry values.
4. Uploaded filenames were normalized using POSIX path handling only. Added cross-platform separator handling and control-character stripping for stored display names and download headers. Added validation for blank upload titles and ensured early validation failures close the uploaded file.
5. Added indexes for creator-owned clip listing and license status/expiry queries.
6. Added regression tests for creator clip privacy, legacy Active license approval, expired-license activation, Windows-style filename sanitization and blank upload titles.
7. Corrected `.env.example` comments that implied a random token signing secret was required; the current database-backed opaque session tokens do not use that variable. Added the existing render concurrency setting to the examples.

## Existing limitations confirmed

- No package-manager lockfile is included. Reproducible frontend installation is not yet possible from a lockfile; do not use `npm ci` until a valid lockfile is generated and reviewed in an environment with registry access.
- Production home/library/search/creator pages have backend-backed panels, but some advanced local legacy experiences remain development-only. Creator upload/edit UI is not fully migrated into the production Creator Content page.
- Saved clips/account preferences do not have server endpoints. Earnings/payouts have no accounting/payment provider. AI analysis/ingestion is not a configured production service. Creator/category directory search is not supported by the current API.
- Password recovery is unavailable without a reset-token flow and configured email delivery.
- Browser E2E has no configured Playwright/Cypress framework and was not run.
- Production HTTPS, external secret manager, malware scanning, durable distributed render queue, backup/restore, monitoring, and penetration testing are not established by this source archive.
