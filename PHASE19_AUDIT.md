# JHONNY AI — Phase 19 Audit

## Input and reproducibility
- Input: `jhonny-ai-phase18.zip`, extracted and inspected before edits. ZIP CRC validation succeeded; 126 entries were present.
- Existing architecture retained: React 19 + TypeScript + Vite + Tailwind CSS 4; FastAPI + SQLite; custom client router and `src/lib/api.ts`; backend tests in `backend/tests/test_api.py`.
- Existing frontend test command uses Node's test runner with `tsx`; no `package-lock.json`, `npm-shrinkwrap.json`, `pnpm-lock.yaml`, or `yarn.lock` was present. No repository history was packaged, so lockfile/history recovery from Git is unavailable.

## Reproduced baseline blockers
- Backend baseline: `python -m pytest backend/tests -q` — 36 passed before Phase 19 changes.
- Registry resolution: `npm view tsx version --fetch-retries=0 --fetch-timeout=5000` — failed with `EAI_AGAIN` resolving `registry.npmjs.org`.
- Frontend dependencies are not present in the archive and npm cache listing was empty. A successful package resolution and lockfile generation cannot be claimed in this environment. A Phase 19 `npm install` attempt timed out with exit 124 after 12 seconds.

## Findings and changes
| Severity | Finding | Evidence / reproduction | Phase 19 action |
|---|---|---|---|
| High | No lockfile means dependency resolution is not reproducible. | Archive inspection found no supported package-manager lockfile; registry DNS lookup failed. | Added explicit Node/npm engine minimums; preserved existing npm scripts and package manager. Lockfile remains blocked until a successful npm resolution can run. |
| Medium | Shared API client could relay arbitrary backend `detail` text for 5xx responses. | `src/lib/api.ts` previously surfaced JSON `detail` for every non-2xx status, including server errors. | 5xx responses now use a stable generic message for JSON requests, uploads and downloads. |
| Medium | Shared API client treated an intentionally empty successful response as malformed JSON. | Success path always called `response.json()`. | HTTP 204 and explicit zero-length successful responses return `undefined`; other malformed/empty JSON responses remain normalized to `ApiError(502)`. |
| Medium | Download fallback filename was not sanitized as thoroughly as a server-provided filename. | Download helper sanitized server filename only. | Both fallback and server-provided names now have path/control characters removed and are length-limited. |
| High | Critical download, licensing, ownership and role boundaries must remain server-side. | Existing backend regression suite exercises these routes and policies. | Authorization rules were not relaxed; full backend suite rerun after changes. |

## Scope limitations
- This archive has no Git metadata, so repository history could not be inspected.
- Frontend package install/build/lint/typecheck/test and browser E2E require dependencies not included in the archive. Network registry resolution was unavailable; these are reported as blocked/failed, not passed.
- Password recovery/email, verified creator payouts, and AI analysis remain non-operational integrations. Rendering remains an in-process background task and is not restart-durable.
