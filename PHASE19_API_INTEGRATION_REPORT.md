# JHONNY AI — Phase 19 API Integration Report

## Method
Compared `src/lib/api.ts` helpers with the real FastAPI routes in `backend/app/main.py`, and reran backend integration tests. This is source-level contract verification plus backend tests, not browser network-capture evidence.

## Critical contracts reviewed
| Frontend operation | Backend contract | Auth and notes |
|---|---|---|
| Register/login/current user/logout | `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/logout` | Registration/login public; identity/logout bearer-authenticated. A 401 clears the stored session and dispatches `jhonny:auth-expired`. |
| Public clip listing/details | `GET /api/clips`, `GET /api/clips/{clip_id}` | Optional bearer; backend controls visibility of unpublished/private content. Pagination query uses `page` and `page_size`. |
| Creator upload and owned clips | `POST /api/clips/upload`, `GET /api/me/clips` | Creator/admin bearer; multipart upload sends `file` and `title`, with progress events and response shape checks. |
| Download and history | `GET /api/clips/{id}/download`, `GET /api/me/downloads` | Downloads require authentication and server-side publication/license/use checks; history is user-scoped. |
| Studio projects | `GET/POST /api/projects`, `PUT/DELETE /api/projects/{id}`, `POST /api/projects/{id}/duplicate` | Authenticated; ownership checked on backend. |
| Render jobs | `POST /api/projects/{id}/renders`, `GET /api/renders/{id}`, `GET /api/renders/{id}/download` | Authenticated; job/project ownership checked on backend. |
| Admin moderation/licensing | `POST /api/admin/clips/{id}/moderate`, `PUT /api/admin/clips/{id}/license` | Server requires admin; frontend visibility is not the security boundary. |

## Phase 19 client behavior
- Non-2xx JSON requests use backend `detail` only for client errors; server-side 5xx errors receive a stable generic message.
- HTTP 204 and explicitly zero-length successful responses are treated as empty successful results. Other malformed/empty JSON success bodies produce `ApiError` status 502.
- Network failures produce `ApiError` status 0.
- Upload handles progress, malformed success payloads, 401 expiry, and generic 5xx errors.
- Downloads use bearer authorization, reject non-2xx and empty files, and sanitize both response and fallback filenames.

## Not verified
Frontend runtime tests, full typecheck, lint, Vite production build, and browser E2E could not execute because npm dependencies were unavailable and registry DNS resolution failed. Contract review does not substitute for those checks.
