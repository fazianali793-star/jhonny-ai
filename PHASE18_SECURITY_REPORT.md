# JHONNY AI — Phase 18 Security Report

## Verified controls
- New account registration cannot request creator/admin role; admin role promotion is protected by `require_admin`.
- Sessions are opaque random bearer tokens; only SHA-256 token hashes are stored. Logout removes the session record and expired/disabled accounts are rejected.
- Public clip listing/detail filters unpublished, inactive-license and expired-license content.
- Clip downloads require authentication, published state, active unexpired license, permitted requested use, and a path contained within the media directory.
- Project/render endpoints check ownership server-side. Render downloads verify job ownership and completed state before serving media.
- Upload extension/MIME allowlists, size limit, server-generated stored filenames, FFprobe metadata inspection, and private media storage are present.
- Phase 17's safe database health response and generic FFmpeg failure message remain in place.

## Phase 18 changes and regression evidence
1. Registration now trims name/email before persistence and rejects whitespace-only names (`test_registration_rejects_whitespace_only_name`).
2. Completed render downloads are verified owner-scoped (`test_render_download_is_owner_scoped_even_for_completed_job`): owner succeeds; unrelated user receives 403.
3. Frontend successful-response parsing errors now use a normalized `ApiError` instead of leaking a raw `SyntaxError`. Frontend runtime tests for this helper were blocked by missing npm dependencies.

## Severity and remediation status
| Area | Status | Notes |
|---|---|---|
| Object-level render authorization | Verified by new regression test | Unauthorized download rejected. |
| Admin authorization | Existing tests pass | Role checks occur in FastAPI dependencies. |
| Clip license/publication download checks | Existing tests pass | Tests exercise unpublished and active license flow. |
| Registration input normalization | Fixed and tested | Blank normalized name rejected. |
| API malformed JSON response | Fixed in source | Runtime test/build blocked by dependency availability. |
| File malware scanning | Not implemented | Requires a configured scanner/service; do not upload untrusted public media without operational controls. |
| Rate limiting | SQLite-backed, single shared DB required | Not distributed across separate DBs; proxy controls still recommended. |
| Session storage in browser | Bearer token in `sessionStorage` | XSS prevention remains important; evaluate secure cookie design before public deployment. |
| Durable rendering | Not implemented | In-process tasks are not restart-safe. |
| Production security | Not certified | HTTPS, secret handling, backup/restore drills, monitoring and independent penetration testing remain outstanding. |

No production database was used for testing. Tests use isolated temporary SQLite databases.
