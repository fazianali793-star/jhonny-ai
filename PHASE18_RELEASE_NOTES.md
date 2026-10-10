# JHONNY AI — Phase 18 Release Notes

Phase 18 continues the supplied Phase 17 source tree and preserves the existing React/FastAPI architecture and UI.

## Changes
- Registration now normalizes the name and email before database writes and rejects names that become empty after trimming.
- Shared frontend API client maps malformed/empty JSON from a nominally successful HTTP response to a stable `ApiError` status 502.
- Added backend regression tests for whitespace-only registration names and render-download ownership.
- Added Phase 18 audit, API contract, security, test, release and deployment reports.

## Verification status
Backend test suite passes. Frontend build/typecheck/lint/E2E remain blocked until dependencies are available and can be installed reproducibly. This is a partially verified release candidate, not a production-readiness certification.
