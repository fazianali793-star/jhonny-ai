# JHONNY AI — Phase 18 API Contract Report

## Method
Compared the shared frontend API helpers in `src/lib/api.ts` with route definitions in `backend/app/main.py`. This is a source-level contract review plus backend integration tests, not a browser network capture. The frontend build could not be run because dependencies were unavailable.

## Verified critical contracts

| Frontend operation | Backend route | Auth | Contract notes |
|---|---|---|---|
| `loginApi` | `POST /api/auth/login` | Public | JSON `{email,password}`; response contains `access_token`, `token_type`, `expires_in`, `user`. Token is stored in `sessionStorage`. |
| `registerApi` | `POST /api/auth/register` | Public | JSON `{name,email,password}`; response has user identity and role. Server only permits initial `user` role. |
| `currentUserApi` | `GET /api/auth/me` | Bearer | Returns identity, role and `created_at`; invalid/expired token returns 401. |
| `logoutApi` | `POST /api/auth/logout` | Bearer | Deletes the hashed session record; client clears token in `finally`. |
| `fetchApiClips` | `GET /api/clips` | Optional bearer | `q`, `status`, `sort`, `page`, `page_size`; response `{items,page,page_size,total}`. Anonymous library is restricted to published, active, unexpired licensed clips. |
| `fetchApiClip` | `GET /api/clips/{clip_id}` | Optional bearer | Encoded ID/slug; server hides non-public records from anonymous and unrelated users. |
| `uploadApi` | `POST /api/clips/upload` | Creator/admin bearer | Multipart `file` and `title`; response includes ID/status/media metadata. Upload helper validates response shape and dispatches auth-expiry event on 401. |
| `fetchMyClips` | `GET /api/me/clips` | Creator/admin bearer | Query filters/pagination; only owner's clips returned. |
| `fetchMyDownloads` | `GET /api/me/downloads` | Bearer | Returns `{items,total}` for authenticated user only. |
| `fetchMyLicenses` | `GET /api/me/licenses` | Creator/admin bearer in practice | Server explicitly rejects non-creator/non-admin. |
| `fetchApiProjects` | `GET /api/projects` | Bearer | Returns authenticated user's projects. |
| `createApiProject` | `POST /api/projects` | Bearer | JSON `{name,source_clip_id,settings}`; source clip ownership is checked server-side. |
| `saveApiProject` | `PUT /api/projects/{id}` | Bearer | JSON project fields; server checks owner/admin and source ownership. |
| `duplicateApiProject` | `POST /api/projects/{id}/duplicate` | Bearer | Server permits only project owner. |
| `deleteApiProject` | `DELETE /api/projects/{id}` | Bearer | Server checks owner/admin. |
| `createApiRender` | `POST /api/projects/{id}/renders` | Bearer | JSON trim, dimensions, aspect ratio and format; validates ownership, source, duration and render capacity. Returns 202 queued job. |
| `fetchApiRender` | `GET /api/renders/{id}` | Bearer | Returns status/progress; server checks owner/admin. |
| `downloadApiFile` | Download routes | Bearer | Reads response as blob, rejects non-2xx and empty blobs, sanitizes filename. |
| `moderateApiClip` | `POST /api/admin/clips/{id}/moderate` | Admin | Server authorization enforced. |
| `updateApiLicense` | `PUT /api/admin/clips/{id}/license` | Admin | Server authorization and license validation enforced. |

## Error behavior
- Backend returns FastAPI JSON `detail` for ordinary errors.
- `apiRequest` clears a stored token and dispatches `jhonny:auth-expired` on 401.
- Phase 18 normalizes a malformed/empty successful JSON response to `ApiError(..., 502)` rather than exposing a raw JSON parser exception.
- Network failures become `ApiError` status 0.
- Browser-level confirmation of expired-session navigation and visual outage states remains unverified because frontend dependencies/browser tooling were unavailable.

## Contract gaps / limitations
- This source review is not an exhaustive proof of every visual component's call sites.
- No frontend dependency install, Vite build, lint, full TypeScript check, or E2E network inspection completed in this environment.
