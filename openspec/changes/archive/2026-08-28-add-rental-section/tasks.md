## 1. Navigation and routing

- [x] 1.1 Add a «Прокат» menu item (`id: "rental"`, `ShoppingBasket` icon) to the shared `items` array in `src/app/Layout.tsx` and verify it appears in the desktop aside and mobile burger menu, highlighting while any `/rental` route is open.
- [x] 1.2 Add `/rental` (catalog) and `/rental/my` routes in `src/app/router.tsx`; guard `/rental/my` with `isAuthorized()` redirect to `/login` (same as `/printer`); verify hash URLs resolve type-safely (`pnpm typecheck`).

## 2. Shared rental helpers

- [x] 2.1 Create `src/pages/rental/helpers.ts` with a FastAPI error-to-text helper (string/object `detail`, `ru` fallback «Неизвестная ошибка»), Russian labels + `Label` theme per `RentStatus`, and a date-time formatter using `dateTime({ input }).format("DD.MM.YYYY HH:mm")`.

## 3. Catalog page

- [x] 3.1 Create `src/pages/rental/RentalCatalogPage.tsx` + `ui/ItemTypeCard.tsx`: card grid fed by `getItemsTypesItemtypeGetOptions` (works anonymously) showing image, name, description, available count and cooldown; empty/loading states.
- [x] 3.2 Add the reserve action per card (`createRentalSessionRentalSessionsItemTypeIdPostMutation` with `auth: token`): disabled when `availability` is false, count is 0 or cooldown is active; anonymous users are sent to `/login`; success toast + catalog refresh, error toasts.

## 4. My rentals page

- [x] 4.1 Create `src/pages/rental/RentalMyPage.tsx`: sessions list fed by `getMySessionsRentalSessionsUserMeGetOptions` with status filter (multi-select of the 7 statuses mapped to `is_*` query flags), joining item-type names from the catalog query; each row shows status label, reservation/start/deadline/end timestamps and opens a detail dialog using `getRentalSessionRentalSessionsSessionIdGetOptions`.
- [x] 4.2 Add confirmed cancellation of `reserved` sessions (`cancelRentalSessionRentalSessionsSessionIdCancelDeleteMutation`) with invalidation and toasts.
- [x] 4.3 Render the user's strikes (`getUserStrikesStrikeUserUserIdGetOptions` with `loginData.user_id`) with reason/admin/date, empty state «Страйков нет».

## 5. Feedback and validation

- [x] 5.1 Wire success/error toasts (`rental-*` names) into every mutation using the shared error helper; verify a triggered permission error («Не хватает прав»/«Not authorized») displays readable text.
- [x] 5.2 Run `pnpm typecheck` and `pnpm lint:all` and resolve findings in files touched by this change; smoke-test catalog and my-rentals pages against the live test API with the provided account.
