# JHONNY AI Phase 2: verification report

## What could NOT be run

| Check | Result | Why |
|---|---|---|
| `npm install` | **Blocked** | `registry.npmjs.org` does not resolve from the sandbox (`curl: Could not resolve host`), `npm view` timed out, and `npm install --offline` failed with `ENOTCACHED` (the local cache has none of the project's packages). Network restrictions were not bypassed. |
| `npm test` | **Not run** | Needs `node_modules` (`tsx`). |
| `npm run lint` (`tsc --noEmit`) | **Not run** | Needs `typescript`, `vite/client`, `@types/react`, `lucide-react` and the other packages. |
| `npm run build` (`vite build`) | **Not run / not verified** | Needs `vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `react`, etc. **The production build has not been confirmed to pass.** |
| Running the app in a browser | **Not done** | Needs the build/dev server. UI behavior was reviewed by reading code only. |
| Lockfile | **Not generated** | `npm install --package-lock-only` also needs the registry. |

## What WAS run (substitutes, not equivalent to the npm scripts)

| Check | Result |
|---|---|
| Unit tests: `tsx --test tests/*.test.ts` using a globally installed `tsx` v4.23.12 on Node 22.22.0 (same test files `npm test` runs) | 88 tests, 88 pass, 0 fail (20 suites) |
| Type check of the framework-free modules (`src/lib/*`, `src/data/mockData.ts`, all `tests/*`) with a globally installed TypeScript 6.0.3 and local `@types/node`, `isolatedModules`, no `strict` (as in `tsconfig.json`) | 0 errors |
| Syntax parse of all 72 `.ts`/`.tsx` files with a global esbuild | 0 parse errors |

**TSX components were NOT type-checked** (no React types available) and the project's pinned TypeScript 7 was not used.

## Baseline vs. now

Before changes: 69 tests, all passing (measured with Node's built-in type stripping, which needed `import type` in `mockData.ts` to load). After the fixes and new tests: 88 tests, all passing under `tsx`.

## Still mocked or not real

See the README sections "What is NOT real in this build" and "Sample data".
