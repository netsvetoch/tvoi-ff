## 1. Navigation and routing

- [x] 1.1 Add a «Знакомства» menu item (`id: "dating"`, `Heart` icon) to the shared `items` array in `src/app/Layout.tsx` and verify it appears in the desktop aside and mobile burger menu, highlighting while a `/dating` route is open.
- [x] 1.2 Add `/dating` (list) and `/dating/$id` (detail) routes in `src/app/router.tsx` following the existing `$id` pattern and verify hash URLs (`#/dating`, `#/dating/<id>`) resolve type-safely (`pnpm typecheck`).

## 2. Profiles list page

- [x] 2.1 Create `src/pages/dating/DatingPage.tsx` with `PageHeader` + `Container` and a card grid fed by `useInfiniteQuery(getProfilesProfilesGetInfiniteOptions)` (page size 12), rendering name/age/gender/description/interests per card; verify cards navigate to `/dating/$id`.
- [x] 2.2 Add age-range (two numeric inputs) and gender (`Select` with мужской/женский, clearable) filters that reset accumulated pages on change; verify against the test API that filtered requests include `min_age`/`max_age`/`gender` and an empty result shows «Анкеты не найдены».
- [x] 2.3 Implement «Показать ещё» pagination shown while the last fetched page is full and hidden after a short/empty page; verify by browsing the live test list past one page.

## 3. Profile detail page

- [x] 3.1 Create `src/pages/dating/DatingProfilePage.tsx` showing all profile fields plus created date from `getProfileProfilesProfileIdGetOptions`, with a 404/error state for unknown profiles; verify with an existing id and a nonexistent id against the test API.
- [x] 3.2 Render the comment feed via `getCommentsForProfileCommentsProfilesProfileIdCommentsGetInfiniteOptions` with author/text/date and «Показать ещё» pagination; verify profiles with >10 comments paginate.

## 4. Mutations

- [x] 4.1 Add a create-profile `Dialog` on the list page reusing a shared `ProfileForm` (required name/age/gender/contact, optional description/interests, gender Select, age validated as integer 1–150, invalid fields block submission); verify a created profile against the test API and that success navigates to the new profile's page.
- [x] 4.2 Add inline editing on the detail page using the same prefilled `ProfileForm` with cancel; verify an update round-trip against the test API and that displayed values refresh via query invalidation.
- [x] 4.3 Add confirmed profile deletion (danger `Dialog`) that navigates to `/dating` and invalidates the list, and confirmed comment deletion that refreshes the feed and detail query; verify both delete flows against the test API.
- [x] 4.4 Add the comment form (author name + text, both required) that appends to the feed and clears on success; verify create against the test API and that empty fields are marked invalid without sending a request.

## 5. Feedback and validation

- [x] 5.1 Add a shared error-message helper for FastAPI shapes (`detail[]` validation messages, string `detail`, fallback «Неизвестная ошибка») and wire success/error toasts (`dating-*` names) into every mutation; verify a triggered 422 shows validation text and successes show success toasts.
- [x] 5.2 Run `pnpm typecheck` and `pnpm lint:all` and resolve findings in files touched by this change.
