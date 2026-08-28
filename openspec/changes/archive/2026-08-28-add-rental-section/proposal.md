## Why

The rental API client (`src/shared/api/rental/`) is fully generated but unused: the app exposes no UI for the профком-прокат (item rental) service. Probing the test backend with the provided account (user_id 347) confirmed: the item-type catalog `GET /itemtype` works anonymously; session/strike endpoints require the shared profcomff auth token; write operations are additionally scope-gated on the server (`rental.session.create`). The provided account currently has no rental scopes, so privileged operations return «Не хватает прав» for it — the backend, not the UI, enforces scopes; the UI surfaces such errors as toasts.

## What Changes

- Add a «Прокат» section to the aside navigation (desktop `AsideHeader` menu and mobile burger menu) leading to `/rental`.
- Add a catalog page at `/rental`: item-type cards (image, name, description, available count, cooldown) with a reservation action (`POST /rental-sessions/{item_type_id}`) that requires login.
- Add a «Мои аренды» page at `/rental/my` (login required): the user's sessions from `GET /rental-sessions/user/me` with status filters, session detail via `GET /rental-sessions/{session_id}`, cancellation of reserved sessions, and the user's strikes from `GET /strike/user/{user_id}`.
- All authenticated calls pass the stored session token via the generated client's `auth` option (same pattern as the printer page). The login flow is NOT changed: requesting rental scopes at login would fail for users without them.
- Mutations refresh affected queries and report success/failure via toasts; FastAPI error shapes (`detail` string/object/array, `ru`) are converted to text.
- The generated client under `src/shared/api/rental/` is consumed only, never hand-edited.
- Admin endpoints (session management, item/type CRUD, strikes CRUD, event log) are intentionally out of scope for now and remain available for a follow-up change.

## Capabilities

### New Capabilities

- `rental-section`: catalog browsing and reservation, plus personal rentals and strikes.

### Modified Capabilities

None. Routing keeps following the existing `routing` spec patterns (code-based tree, hash history, nested segments) without requirement changes.

## Impact

- `src/app/Layout.tsx`: new navigation item.
- `src/app/router.tsx`: new `/rental` and `/rental/my` routes (`/rental/my` guarded like `/printer`).
- New `src/pages/rental/` page module following existing page conventions (`PageHeader`, `Container`, generated TanStack Query hooks, `useToaster`, `Dialog` forms).
- `src/shared/api/rental/` consumed only; generated files stay untouched.
- No dependency or build changes. The provided credentials are used only for live API verification and are not stored in the repo.
