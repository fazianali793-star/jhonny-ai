# JHONNY AI Phase 3 — implementation report

## Implemented in this archive

- Added FastAPI backend, SQLite schema, foreign keys/indexes, and a forward-compatible `verification_note` column migration.
- Added real registration/login/logout/current-user endpoints, PBKDF2-HMAC-SHA256 password hashing, opaque expiring bearer sessions, and server-side role checks. Registration cannot self-assign creator/admin privileges.
- Added operator-only admin bootstrap and admin-only user/creator role assignment.
- Added creator-only real video uploads with generated filenames, extension/MIME/size checks, FFprobe metadata verification, private media storage, and Pending status + Pending Review license by default.
- Added clip visibility endpoints and server-side download gates for Published status, Active/unexpired license, allowed usage, platform restrictions, private file path containment, and download logging.
- Added owner-scoped Studio project CRUD endpoints.
- Added FFmpeg MP4 rendering through FastAPI background tasks, job status, owner checks, and protected rendered-file download.
- Added admin moderation and license endpoints. Publication requires an active, unexpired license; activating a license requires a documented rights-verification note.
- Connected existing login and registration screens to backend APIs. Connected the existing creator upload modal to real multipart upload and progress reporting. The existing Phase 2 UI and route layout are retained.
- Added backend automated tests and setup/API documentation.

## Test results from this environment

- `python -m pytest backend/tests -q`: **10 passed**. Includes registration/login/logout/session expiry, duplicate registration, server-side admin authorization, unsupported upload rejection, license/publication checks, unauthorized downloads, project ownership, role promotion permissions, and a real FFmpeg/FFprobe upload → license activation → moderation → download → render → rendered download integration flow.
- `npm test`: **blocked** because dependencies are not installed; Node reports `ERR_MODULE_NOT_FOUND` for `tsx`.
- `npm run lint`: **blocked** because dependencies are not installed; TypeScript reports missing `@types/node` and `vite/client` definitions.
- `npm run build`: **blocked** because the Vite executable is unavailable (`vite: not found`).
- FFmpeg and FFprobe were present and the end-to-end media integration test passed.
- No attempt was made to bypass network restrictions to install frontend packages.

## Incomplete / not yet integrated

- The existing Library/Browse, clip detail/download dialog, Studio project UI, and Admin pages still primarily use Phase 2 local/demo state. The backend endpoints exist, but these screens are not all switched to server-backed records yet.
- Existing localStorage demo data is preserved; there is no automatic localStorage-to-SQLite import or full data migration utility yet.
- Forgot-password/email verification are not implemented.
- Render job execution uses FastAPI in-process background tasks. It is not a durable queue, and job recovery after process restart is not guaranteed. Progress is coarse status-based, not frame-level FFmpeg progress.
- Upload UI requires a real backend session whose server role is `creator` or `admin`. New users register as `user`; an administrator must promote a verified creator account.
- License verification is an admin-entered attestation note, not an automated legal/copyright verification service.
- Production hardening remains necessary: HTTPS, secure HttpOnly cookie/session design or managed identity, rate limiting, malware scanning, quotas, storage lifecycle, durable workers, backups, formal migrations, and deployment review.

## Security caveats

- Frontend route guards and localStorage role values are usability only. API endpoints enforce authorization server-side.
- Bearer tokens are stored in browser `sessionStorage` in this initial frontend integration; an XSS flaw could expose them. Prefer secure HttpOnly cookies or a managed identity provider before public deployment.
- This is a development baseline, not a production security certification. Do not expose the service publicly without the hardening items above.
