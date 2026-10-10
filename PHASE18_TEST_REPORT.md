# JHONNY AI — Phase 18 Test Report

## Backend checks
| Command | Result |
|---|---|
| `python -m pytest backend/tests -q` | **36 passed in 5.95s**, zero failures/skips |
| `python -m compileall -q backend/app backend/tests` | Exit 0 |
| Extract final ZIP, then `python -m pytest backend/tests -q` | **36 passed in 6.26s**, zero failures/skips |
| Final ZIP integrity (`ZipFile.testzip`) | Passed; no corrupt members |
| Required source/reports in final ZIP | Present |
| Secret/runtime artifact scan | No real `.env`, SQLite database, bytecode cache or `node_modules` packaged |

## Regression tests added
- `test_registration_rejects_whitespace_only_name`
- `test_render_download_is_owner_scoped_even_for_completed_job`

## Frontend checks
| Command / check | Result |
|---|---|
| Global TypeScript `transpileModule` syntax-only scan of `src` | **66 TS/TSX files; 0 syntax errors**, exit 0. This is not a full typecheck. |
| `npm test` | Exit 1; all 7 test files failed to load because `tsx` is not installed; 0 frontend tests executed. |
| `npm run typecheck` | Exit 2; `node` and `vite/client` type definitions missing. |
| `npm run lint` | Exit 127; ESLint command unavailable/permission denied in this environment. |
| `npm run build` | Exit 127; Vite command unavailable/permission denied in this environment. |
| Browser E2E | Not run; no installed browser automation setup. |
| Dependency installation | Not successfully completed in Phase 17 environment; npm registry DNS had previously failed with `EAI_AGAIN`. No lockfile was fabricated. |

## Integration coverage
Backend tests exercise registration/login/logout/session expiry, server-side admin checks, public library visibility, upload extension rejection, licensing/moderation, download permissions, project ownership, and FFmpeg rendering when tools are available. The new render download test checks both owner success and unrelated-user denial.

Frontend-to-backend review is documented in `PHASE18_API_CONTRACT_REPORT.md`; visual/browser confirmation remains blocked. Blocked and unrun checks are not counted as passed.
