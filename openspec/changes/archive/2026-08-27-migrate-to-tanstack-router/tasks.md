# Tasks

## Grounding

- [x] `pnpm dlx @tanstack/intent@latest list` (workspace root);
      загружены sub-skill'ы `@tanstack/router-core` (type-safety и др.)
- [x] Сверить API по документации: `createRootRoute`/`createRoute`/
      `createRouter`, `createHashHistory` из `@tanstack/react-router`,
      index-маршруты (`path: "/"`), `redirect({ to, search })`,
      `navigate({ href })`, `useSearch`/`useParams` c `from`,
      `strict: false` для общих компонентов

## Router core

- [x] `src/app/router.tsx`: корневой маршрут с `Layout` +
      `notFoundComponent: () => null`; все маршруты и редиректы из
      прежнего дерева; `beforeLoad` вместо loader-редиректов;
      `validateSearch` для `/login`, `/timetable/events/`,
      `/auth/register/success`
- [x] `src/app/main.tsx`: `RouterProvider` от tanstack +
      `declare module "@tanstack/react-router" { interface Register }`

## Pages / hooks

- [x] `useParams({ from })`: TimetableGroupPage, TimetableRoomPage,
      TimetableLecturerPage, TimetableEventPage, LecturerRatingPage;
      MapPage и Map — `strict: false`
- [x] `useNavigate({ to, params })`: Layout, PageHeader (`href`),
      PrinterLoginPage, LecturersTable, ProfileDropdownMenu, EmailLoginForm,
      GroupsTable, EventVisitStatus (+RelationLinks), TimetableRoomsPage,
      TimetableLecturersPage, EventCard, LecturerPhotos, MapPage, Map
- [x] `useSearchParams` → `validateSearch` + `useSearch`: LoginPage,
      TimetableEventsPage (updater `search`, сохранение прочих фильтров)

## Cleanup & verify

- [x] Удалить `react-router` из package.json, обновить lockfile
- [x] Удалить мёртвый код: `src/pages/HomePage.tsx`,
      `updateTimetableFilter` (+ тесты)
- [x] `pnpm typecheck && pnpm build` — чисто
- [x] eslint/prettier по изменённым файлам — чисто;
      `vitest run src/shared/helpers/timetable.test.ts` — 15/15
