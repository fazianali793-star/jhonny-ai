# JHONNY AI — Phase 18 Audit

## Scope and method
Input archive: `jhonny-ai-phase17(1).zip` (140 entries; ZIP CRC check passed). Extracted before edits. The archive retains the existing `jhonny-ai-phase16/` root directory and contains the Phase 17 reports. Baseline architecture and previous findings were rechecked against source, not accepted solely from prior reports.

## Architecture verified
- Frontend: React 19, TypeScript, Vite, Tailwind CSS 4; custom router and shared API client in `src/lib/api.ts`.
- Backend: FastAPI in `backend/app/main.py`, SQLite schema initialized at startup, opaque bearer sessions with token hashes, PBKDF2-HMAC-SHA256 password hashing.
- Media: private local storage, FFprobe validation, FFmpeg rendering, in-process FastAPI background tasks.
- API tests: `backend/tests/test_api.py`; frontend tests use Node's test runner and `tsx`.

## Findings and actions
| Severity | Finding | Reproduction / evidence | Action |
|---|---|---|---|
| Medium | Registration accepted whitespace-only names after Pydantic's pre-trim minimum-length validation. | POST `/api/auth/register` with `name: "   "` passed schema length validation before the fix. | Trim and validate normalized name server-side; added regression test. |
| Medium | Successful HTTP response with malformed/empty JSON escaped `apiRequest` as a raw `SyntaxError`, complicating page error states. | Inspect `src/lib/api.ts`: previous success path returned `response.json()` without normalization. | Convert parse failures to `ApiError` status 502 with a stable message. Frontend runtime test remains blocked by unavailable npm dependencies. |
| High | Render download access is security-sensitive and requires object-level ownership enforcement. | Existing endpoint checks job owner/admin before resolving the output path. Added positive owner and negative other-user regression test. | Verified by backend test. |
| High | Admin, download, licensing, creator ownership and render access are critical trust boundaries. | Existing API tests exercise role checks, license state, public listing and project ownership. | No authorization relaxation; test suite rerun. |
| Medium | Frontend dependency installation/build checks are not reproducible in the current environment because registry DNS/dependencies are unavailable. | See `PHASE18_TEST_REPORT.md`. | No fabricated lockfile or fake build result; documented as blocked. |

## Workflow evidence
- Backend automated tests verify registration/login/logout/session expiry, admin authorization, public listing filtering, upload type rejection, license/moderation flow, download authorization, project ownership and FFmpeg render flow when FFmpeg is available.
- A new test checks completed render download for the owner and rejects a different user.
- Full browser-based user journeys were not run; frontend runtime dependencies are not installed.

## Known limitations
- No npm lockfile was present in the supplied archive.
- Password recovery/email delivery, creator payouts/accounting and AI analysis are not operational integrations.
- Render jobs remain in-process and may not survive restart; not suitable as a durable production queue.
- Production deployment controls (HTTPS, secrets manager, backups/restore drill, monitoring, malware scanning, independent penetration test) remain deployment responsibilities.
- A passing backend suite does not certify production readiness.
