## Context

The dating API is fully generated (`src/shared/api/dating/`, hey-api client + TanStack Query options) and completely anonymous: the OpenAPI spec declares no security schemes, and probing confirmed all endpoints respond without credentials. Backend quirks confirmed by probing the test environment (see proposal.md - Why): list pagination starts at page 1 with no total count, filters are `min_age`/`max_age`/`gender` (values `мужской`/`женский`), profile detail embeds comments, and errors are FastAPI-shaped (`{detail: [...]}` for 422, `{detail: "Not Found"}` for 404). The app's page conventions are set by `src/pages/rating/` (generated query options, `useMutation` wrappers, `useToaster`, confirm `Dialog`s, `PageHeader` + `Container`).

## Goals / Non-Goals

**Goals:**

- Wire every generated dating endpoint into UI: list with filters and pagination, detail, create, update, delete, comment list, comment create, comment delete.
- Follow existing page/navigation conventions so the section reads like the rest of the app.

**Non-Goals:**

- No auth/ownership logic (API has none), no moderation, no profile photos (API has no media), no URL-synced filters (list filters stay local state, matching the rating page).

## Decisions

### Routes and navigation

`/dating` (list) and `/dating/$id` (detail), code-based routes in `src/app/router.tsx` following the routing spec's `$id` pattern. New menu item in `Layout.tsx` (`id: "dating"`, title «Знакомства», `Heart` icon from `@gravity-ui/icons`) added to the shared `items` array, so desktop `AsideHeader` and mobile burger menu pick it up together. No login gating — the section is public like timetable/rating/map.

### Page module layout

`src/pages/dating/` with `DatingPage.tsx` (list), `DatingProfilePage.tsx` (detail), `index.ts` barrel, and `ui/` components: `ProfileCard`, `ProfileForm` (shared by create and edit), `DatingCommentCard`, `DatingCommentForm`, plus a small `helpers.ts` for error-message extraction. Mirrors `src/pages/rating/` structure.

### List: infinite query + filters in local state

`useInfiniteQuery(getProfilesProfilesGetInfiniteOptions(...))` with page size 12; the generated infinite options already map numeric `pageParam` to `query.page`. Pages are flattened for a CSS-module card grid (`auto-fill` columns). «Показать ещё» is shown while the last fetched page is full; a short or empty page ends the list (the API has no total). Age bounds are two numeric `TextInput`s, gender is a `Select` with `мужской`/`женский` and `hasClear`; any filter change drops the accumulated pages by resetting query state (fresh query key). Empty first page renders an «Анкеты не найдены» state.

### Detail page: profile query + separate comment feed

Profile fields come from `getProfileProfilesProfileIdGetOptions` (its inline `comments` array is not rendered — the feed below is authoritative). Comments use `getCommentsForProfileCommentsProfilesProfileIdCommentsGetInfiniteOptions` with the same «Показать ещё» pattern, so both list endpoints are exercised and long comment threads paginate. Comment/profile mutations invalidate all three query keys (list, detail, comments) since the detail response embeds comments.

### Forms

One `ProfileForm` for create and edit: required name/age/gender/contact, optional description/interests; gender is a `Select` over the two values present in the backend data; age is a numeric `TextInput` validated client-side as an integer 1–150. Validation follows the `RatingCommentForm` pattern (`validationState`/`errorMessage`, no request until valid). Create opens the form in a `Dialog` from the list page and navigates to `/dating/$id` of the created profile; edit renders the form inline on the detail page in place of the read-only fields, with a cancel action.

### Deletions

Confirm `Dialog` with `preset="danger"`, same shape as `LecturerRatingPage`. Profile deletion success navigates to `/dating` and invalidates the list; comment deletion invalidates detail + comment queries.

### Error surface

Generated options use `throwOnError: true`, so mutation `onError` receives the parsed body. A shared helper maps FastAPI errors to text: join `detail[].msg` for validation errors, use string `detail` otherwise (e.g. 404), fallback «Неизвестная ошибка». Detail-page 404 (deleted/unknown profile) renders an error state instead of an empty page. Success/error toasts per spec, namespaced `dating-*`.

## Risks / Trade-offs

- [Blind pagination can race if profiles are deleted mid-browsing] → «Показать ещё» only appends; a short page simply ends the feed; detail handles 404 explicitly.
- [Anonymous API means anyone can edit/delete anything] → accepted: matches backend design; no ownership gating in the spec.
- [Gender filter hardcodes the two observed values] → free-form backend field; the Select is clearable, and unfiltered requests remain possible.
- [Comments embedded in the detail response can go stale relative to the feed] → comment mutations invalidate the detail query too.

## Open Questions

None.
