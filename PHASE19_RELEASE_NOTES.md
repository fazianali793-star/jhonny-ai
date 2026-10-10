# JHONNY AI — Phase 19 Release Notes

## Changes
- Hardened shared frontend API errors so 5xx diagnostics are not surfaced verbatim to users.
- Accepted explicit empty success responses (204 / zero content length) while retaining normalized errors for malformed JSON.
- Sanitized fallback and server-supplied download filenames consistently.
- Declared minimum Node.js/npm engine versions compatible with the current Vite 8 toolchain.
- Added Phase 19 audit, API integration, security, test, and deployment reports.

## Compatibility
Existing React/Vite/FastAPI architecture, API paths, authentication model, licensing, authorization, and UI are preserved. Existing npm scripts and the configured Node test runner are retained.

## Release status
Partial release candidate only. Backend tests can run in this environment; frontend install/test/typecheck/lint/build and browser E2E remain blocked by unavailable npm registry/dependencies. A lockfile was not invented.
