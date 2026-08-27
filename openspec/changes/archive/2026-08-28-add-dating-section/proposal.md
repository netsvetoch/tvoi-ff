## Why

The dating API client (`src/shared/api/dating/`) is fully generated but unused: the app exposes no UI for the «Знакомства» (анкеты) service. Probing the test backend confirmed all eight endpoints work anonymously — no auth scheme exists, `GET /profiles/` paginates from page 1 (default limit 10, no total count), supports `min_age`/`max_age`/`gender` filters, profile detail returns comments inline, and the create/update/delete flows for profiles and comments all succeed (verified with a throwaway probe profile that was removed afterwards).

## What Changes

- Add a «Знакомства» section to the aside navigation (desktop `AsideHeader` menu and mobile burger menu) leading to `/dating`.
- Add a profiles list page at `/dating`: profile cards with age-range and gender filters, plus incremental «Показать ещё» pagination (the API returns no total, so classic pagination is impossible).
- Add a profile detail page at `/dating/$id`: full profile fields, comments (inline from the detail response), a comment form (author name + text), comment deletion, profile editing and confirmed profile deletion.
- Add a create-profile flow opened from the list page: form with name, age, gender, optional description/interests and contact; successful creation navigates to the new profile.
- The dating API is anonymous, so the section requires no login and applies no ownership gating for edit/delete.
- Mutations refresh affected queries and report success/failure via toasts; validation errors surface the API detail when available.
- The generated client under `src/shared/api/dating/` is consumed only, never hand-edited.

## Capabilities

### New Capabilities

- `dating-profiles`: browsing, filtering, creating, updating and deleting dating profiles and their comments in the new navigation section.

### Modified Capabilities

None. Routing keeps following the existing `routing` spec patterns (code-based tree, hash history, `$id` segments) without requirement changes.

## Impact

- `src/app/Layout.tsx`: new navigation item.
- `src/app/router.tsx`: new `/dating` routes.
- New `src/pages/dating/` page module following existing page conventions (`PageHeader`, `Container`, generated TanStack Query hooks, `useToaster`).
- `src/shared/api/dating/` consumed only; generated files stay untouched.
- No dependency or build changes. Provided account credentials are not needed (API is anonymous) and are not stored anywhere.
