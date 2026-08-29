## Why

The achievement API client (`src/shared/api/achievement/`) is fully generated but almost unused: the profile page only renders the current user's achievements, filters out everything without a picture, and renders the raw relative `picture` value (`static/N.png`) as the image `src`, which only resolves on an origin that serves the achievement statics. Probing the test backend with the provided account (user_id 347) confirmed: `GET /achievement`, `GET /user/{user_id}` and `GET /achievement/{id}/reciever` work with the shared profcomff auth token; pictures resolve against the achievement service base URL (`https://api.test.profcomff.com/achievement/static/N.png` returns the image); write operations (`create`, `edit`, `delete`, picture upload, `give`, `revoke`) are scope-gated on the server and return «Not authorized» / «Не хватает прав» for accounts without `achievements.achievement.*` scopes — the backend, not the UI, enforces scopes; the UI surfaces such errors as toasts.

## What Changes

- Fix the existing «Достижения» card in the profile aside: resolve picture URLs against the achievement client base URL, show achievements without pictures, and expose each achievement's name and description.
- Add an achievement management section to the profile page covering every remaining endpoint of `src/shared/api/achievement/`:
  - Achievement catalog from `GET /achievement` with create (`POST /achievement`), edit (`PATCH /achievement/{id}`), delete (`DELETE /achievement/{id}`) and picture upload (`PATCH /achievement/{id}/picture`) actions.
  - Reciever management per achievement from `GET /achievement/{achievement_id}/reciever`: give an achievement to a user (`POST /achievement/{achievement_id}/reciever/{user_id}`) and revoke it (`DELETE /achievement/{achievement_id}/reciever/{user_id}`).
- All authenticated calls pass the stored session token via the generated client's `auth` option (same pattern as the rental and printer pages). The login flow is NOT changed: requesting achievement scopes at login fails for users without them (verified: 403 «Не хватает прав»), so management controls are shown to every logged-in user and server-side permission errors are displayed as danger toasts.
- Mutations refresh affected queries and report success/failure via toasts; FastAPI error shapes (`detail` string/object/array, `ru`) are converted to text (reuse the rental helper pattern).
- The generated client under `src/shared/api/achievement/` is consumed only, never hand-edited.

## Capabilities

### New Capabilities

- `profile-achievements`: viewing own achievements and managing the achievement catalog, pictures and recievers from the profile page.

### Modified Capabilities

None. No routing changes: everything lives on the existing `/profile` route.

## Impact

- `src/pages/profile/ProfilePage.tsx`: aside achievements card rework plus a new management section.
- New files under `src/pages/profile/ui/` for achievement dialogs/cards following existing page conventions (`PageHeader`, `Container`, generated TanStack Query hooks, `useToaster`, `Dialog` forms, `FileDropZone` upload).
- `src/shared/api/achievement/` consumed only; generated files stay untouched.
- No dependency or build changes. The provided credentials are used only for live API verification and are not stored in the repo.
