# JHONNY AI — Phase 17 Release Notes

## Changes

- Made `/api/health` a database-aware readiness check with safe error handling.
- Added real FFmpeg progress reporting to render jobs instead of leaving progress at a fixed low value until completion.
- Prevented raw FFmpeg stderr, which may contain private server paths, from being persisted as a render failure message.
- Added two backend regression tests for health failure handling and render error privacy.
- Added Phase 17 audit, test, security, and deployment documentation.

## Verification

- Backend: 34 passed.
- Python compilation: passed.
- TypeScript syntax-only check: 66 files, zero syntax diagnostics.
- Frontend installation/build/typecheck/lint and browser E2E: blocked or not run due missing dependencies and npm registry DNS failure. See `PHASE17_TEST_REPORT.md`.

## Release decision

This is a **partially verified release candidate**, not a production-ready certification. Do not deploy publicly until full frontend checks and target-environment security/deployment validation are complete.
