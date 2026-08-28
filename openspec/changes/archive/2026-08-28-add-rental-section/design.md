## Context

The rental API lives on the same profcomff test backend as the app's auth service (`https://api.test.profcomff.com/rental`), secured by an `Authorization` apiKey scheme that carries the plain session token. Live probing with the provided account (user_id 347) showed: `GET /itemtype` works anonymously, while session/strike/item endpoints need the token, and all write/admin operations additionally require rental scopes (`rental.session.create`, `rental.session.admin`, ...). The account has no rental scopes — requesting them at login or via `POST /auth/session` fails with «Не хватает прав», and the server rejects scoped calls with `{"detail":"Not authorized"}`. See proposal.md for scope.

## Goals / Non-Goals

**Goals:**

- Reuse the existing app token for rental calls without touching the login flow.
- Server-enforced permissions only: the UI never hides actions based on guessed scopes; failures surface as readable toasts.
- Follow existing page conventions (generated TanStack Query hooks, `PageHeader`/`Container`, `useToaster`, FastAPI error shape handling like dating).

**Non-Goals:**

- Admin endpoints (session management, item/type/strike CRUD, event log) — deferred to a follow-up change per user decision.
- Admin panel gating, scope negotiation, token refresh.

## Decisions

- **Auth wiring**: pass `auth: token` from `useLoginData()` per call (printer pattern) instead of a client interceptor. Alternative: `setConfig` on the rental client — rejected because the generated client must stay untouched and other sections already pass `auth` explicitly.
- **Login unchanged**: requesting rental scopes in `loginEmailLoginPost` would fail login for every user without those scopes (verified live). Alternative: a rental-scoped sub-session via `POST /auth/session` on demand — rejected for this scope since the test account lacks the scopes anyway; the plain token already covers all read endpoints the user-facing part needs plus the reserve call.
- **Catalog is public**: `/rental` renders anonymously; the reserve action redirects to `/login` when there is no token, matching how the app treats login-gated actions. `/rental/my` is guarded in `beforeLoad` like `/printer`.
- **Status filtering**: multi-select of the 7 `RentStatus` values mapped to the API's `is_*` flags; empty selection sends no flags (server returns everything).
- **Session detail**: separate dialog fetching `GET /rental-sessions/{session_id}` rather than reusing list rows, since the detail response can carry fields the list omits.
- **Errors**: shared `getRentalErrorMessage` handles `ru`, string `detail`, and FastAPI `detail[]` shapes, mirroring the dating helper; success/error toasts named `rental-*`.

## Risks / Trade-offs

- [Provided account cannot reserve (no `rental.session.create` scope)] → The reserve flow is implemented per API contract; failures display the server message. Verified the error path returns «Not authorized» text in a toast.
- [Catalog item images may be invalid URLs in test data] → `onError` fallback renders a letter placeholder instead of a broken image.
- [List rows may lack admin-populated fields (`user_fullname`, `deadline_ts`)] → Detail dialog shows them when present; list shows only guaranteed fields plus whatever is non-null.
