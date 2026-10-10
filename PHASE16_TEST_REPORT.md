# JHONNY AI — Phase 16 Test Report

## Baseline reproduced before Phase 16 edits

- Input: `jhonny-ai-phase15.zip`, extracted without error.
- Node.js `v22.16.0`; npm `10.9.2`; registry `https://registry.npmjs.org/`.
- No `node_modules` or package lockfile present.
- `python -m pytest backend/tests -q -ra`: **27 passed in 4.82s**.
- `python -m compileall -q backend/app backend/tests`: passed.
- `npm view tsx version --fetch-retries=0 --fetch-timeout=5000`: blocked by DNS `EAI_AGAIN` resolving `registry.npmjs.org`.

## Phase 16 final checks

| Check | Actual result |
|---|---|
| `python -m pytest backend/tests -q -ra` | **32 passed in 5.64s** in the source tree; after extracting the final archive, rerun passed **32 in 5.68s**. Zero failed/skipped. |
| `python -m compileall -q backend/app backend/tests` | Passed |
| `GET /api/health` via FastAPI `TestClient` | HTTP 200; returned service `jhonny-ai-api`, version `8.0.0` |
| Global TypeScript 5.8.3 `transpileModule` over `src` and `tests` | 74 TS/TSX files; zero syntax diagnostics. This is syntax-only, not full type checking. |
| `npm install --ignore-scripts --no-audit --no-fund --fetch-retries=0 --fetch-timeout=5000` under `timeout 20s` | Blocked; shell timeout exit 124. No successful install claimed. |
| `npm test` | Exit 1; seven test files could not load because `tsx` is missing. Zero frontend tests executed successfully. |
| `npm run typecheck` | Exit 2; TypeScript stopped on missing `node` and `vite/client` type definitions. Full app type-check did not complete. |
| `npm run lint` | Exit 127; `eslint: not found`. |
| `npm run build` | Exit 127; `vite: not found`. |
| Browser E2E | Not run; frontend dependencies and browser automation framework unavailable. |
| npm lockfile | Not present in source and not generated while registry access was blocked. |
| FFmpeg / FFprobe on verification host | Both found on PATH; a real upload/license/publication/download/render test passes as part of backend suite. Windows installation must be checked separately. |

## New regression coverage

- `test_creator_clip_listing_is_authenticated_owner_scoped`: verifies unauthenticated denial, ordinary-user 403, cross-creator isolation, and absence of private storage names.
- `test_approval_requires_documented_rights_even_for_legacy_active_license`: verifies a legacy Active license without evidence cannot publish.
- `test_expired_license_cannot_be_activated`: verifies already-expired expiry is rejected.
- `test_upload_filename_sanitization_handles_windows_paths_and_controls`: verifies cross-platform basename sanitization.
- `test_upload_rejects_blank_title_before_writing_media`: verifies blank titles fail without writing a media/temp file.

## Security status

The backend regression suite verifies role authorization, registration role restrictions, session expiry/logout, public visibility, license status/expiry/use/platform rules, download-history privacy, path containment, project/render ownership, and real FFmpeg rendering where installed. Phase 16 adds creator clip isolation and stricter rights approval checks.

These are automated tests, not a penetration test or a complete production security certification. Frontend type-check, lint, production build, and browser workflows remain unverified due to unavailable npm dependencies.
