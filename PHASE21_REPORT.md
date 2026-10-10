# JHONNY AI — Phase 21 Verification & Regression Fix Report

**Verification date:** 2026-10-10  
**Source of truth:** `jhonny-ai-phase20-updated.zip` supplied for this phase

## Scope and source inspection

- Extracted the supplied ZIP and confirmed it contains 138 files.
- `unzip -t` completed with no ZIP/CRC errors.
- Inspected `README.md`, Phase 18–20 reports, `package.json`, TypeScript/Vite/ESLint configuration, frontend API client and tests, FastAPI routes, backend requirements, and backend tests.
- No `.git` directory, npm lockfile, or `node_modules/` directory exists in the supplied archive. Git status/diff is unavailable. No lockfile was fabricated.
- Node.js `v22.16.0`, npm `10.9.2`, Python `3.13.5`; configured npm registry is `https://registry.npmjs.org/`.

## Actual code change

- `backend/app/main.py`: changed the public clip-library expiry predicate to compare timestamps using SQLite `datetime(...)` rather than lexical string ordering. ISO-8601 timestamps with different timezone offsets can sort lexically differently from their actual instants; this could incorrectly expose an expired clip or hide a valid one. Malformed timestamps fail closed under SQLite's datetime comparison.
- `backend/tests/test_api.py`: added `test_public_library_compares_license_expiry_as_timezone_aware_instants`, which inserts a published clip whose active license expired in a non-UTC timezone and verifies that anonymous public listing does not include it.
- No authentication, authorization, role, ownership, download, licensing, copyright, moderation, or admin controls were weakened.

## Latest verification results

| Check | Result | Details |
|---|---|---|
| ZIP integrity | PASS | `unzip -t /mnt/data/jhonny-ai-phase20-updated.zip`; no errors |
| Backend tests | PASS | `PYTHONPATH=backend python -m pytest backend/tests -q -ra` — **37 passed in 9.09s**, 0 failed, 0 skipped |
| Python compilation | PASS | `python -m compileall -q backend/app backend/tests` — exit 0 |
| TypeScript/TSX syntax-only transpile | PASS (limited) | Global TypeScript 5.8.3 transpiled 74 TS/TSX files with 0 syntax diagnostics. This is not a project typecheck. |
| npm registry connectivity | BLOCKED | `npm ping --fetch-retries=0 --fetch-timeout=8000` failed with `EAI_AGAIN` resolving `registry.npmjs.org`; Python `socket.getaddrinfo` likewise returned temporary name-resolution failure. No proxy is configured. |
| Dependency install / lockfile | BLOCKED / NOT CREATED | Registry is unreachable and npm cache is empty. No `node_modules` or lockfile was generated. |
| `npm test` | BLOCKED / FAILED TO START | All 7 test files failed to load because package `tsx` is not installed; **0 test suites executed**. |
| `npm run typecheck` | BLOCKED | TS2688: missing type definitions for `node` and `vite/client`. |
| `npm run lint` | BLOCKED | `eslint: not found`, exit 127. |
| `npm run build` | BLOCKED | `vite: not found`, exit 127. |
| Browser E2E | NOT RUN | No installed browser/E2E tooling and frontend dependency tree unavailable. |
| npm audit | NOT RUN | Dependency graph could not be resolved from the registry. |

## npm DNS diagnosis and safe recovery

The registry URL in npm configuration is correct. The observed error is DNS/name resolution, not a bad package declaration or an authentication failure. The environment has no configured HTTP(S) proxy, and the npm cache is empty. I did not disable TLS verification, change registry hosts, fabricate package artifacts, or bypass network restrictions.

When network/DNS is available in a trusted environment, from the project root:

```powershell
node --version
npm --version
npm config get registry
Resolve-DnsName registry.npmjs.org
npm ping --fetch-retries=0 --fetch-timeout=15000
npm install --no-audit --no-fund
```

The first successful `npm install` should resolve the declared dependencies and create a real `package-lock.json`. Review and keep that lockfile with the source. Then validate clean installation using `npm ci`, followed by `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build`. Do not run `npm ci` before a lockfile exists. If `Resolve-DnsName` still fails, check the machine's approved DNS/VPN/network policy or ask the network administrator; do not turn off TLS verification or use an untrusted mirror.

## Security and remaining limits

- The new regression test verifies public listing excludes an expired license whose timestamp uses a non-UTC offset.
- The complete backend test suite passes, including existing auth, user isolation, ownership, moderation, download, license, and render tests.
- This is automated regression evidence, not an independent penetration test.
- Frontend full typecheck/lint/build, frontend unit tests, real-browser workflows, npm audit, and production deployment validation remain blocked or not run. The app is **not certified production-ready** based on these results.
- The project still has no lockfile. Reproducible frontend installs remain a prerequisite before release.
