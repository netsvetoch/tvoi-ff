# Migration: react-router → @tanstack/react-router

## Why

Убрать зависимость `react-router` (v8) и перевести роутинг на
`@tanstack/react-router` (code-based route tree), уже установленный
в проекте. Миграция выполнена по официальному чек-листу
TanStack Router («migrate from react-router»): маршруты для каждой
существующей страницы, корневой маршрут, инстанс роутера, глобальная
регистрация типов (`declare module`), замена хуков.

## Scope

- `src/app/router.tsx` — переписан на `createRootRoute`/`createRoute`/
  `createRouter` + `createHashHistory()` (hash-URL сохранены, как в
  прежнем `createHashRouter`); редиректы из RR-лоадеров переехали в
  `throw redirect(...)` внутри `beforeLoad`; `notFoundComponent: () => null`
  на корне воспроизводит прежнее поведение `path="*"` (Layout + пустой
  контент на неизвестных путях).
- `src/app/main.tsx` — `RouterProvider` от `@tanstack/react-router`,
  module augmentation `Register { router }` для строгих типов `to`/`params`.
- Хуки по всем страницам (20 файлов):
  - `useParams` → `useParams({ from: "/literal/$path" })`; Map-страницы
    (один компонент на два маршрута `/map/$floor` и `/map/$floor/$roomName`)
    используют `strict: false`;
  - `useNavigate` → `navigate({ to, params })`; `PageHeader` (хлебные крошки
    принимают готовые строки) использует raw-опцию `navigate({ href })`;
  - `useSearchParams` → `validateSearch` + `useSearch`: `/login`
    (`result=success|error`) и `/timetable/events/` (`roomId`/`groupId`/
    `lecturerId`); изменение фильтра — `navigate({ search: prev => ... })`,
    прочие фильтры сохраняются (требование spec `timetable-navigation`).
- `auth/register/success` — `token` читается через `validateSearch`,
  редиректы `/login?result=…` сохранены.

## Key decisions

1. Параметры детальных маршрутов нормализованы к `$id`
   (`/timetable/groups/$id` и т.п.) — имена параметров внутренние,
   публичные URL не изменились; это позволяет `RelationLinks` в
   TimetableEventPage строить типизированный union
   `` `${path}/$id` `` для трёх каталогов.
2. Значения path-параметров типизируются как `string` — в вызовах
   `navigate` передаём `String(id)`.
3. Удалены `react-router` (devDependencies + lockfile) и мёртвый код:
   `src/pages/HomePage.tsx` (использовался только как element
   редиректящего index-маршрута) и хелпер `updateTimetableFilter`
   (заменён updater-функцией `search` в navigate) вместе с его тестами.
4. Структура URL и поведение фильтров проверены против
   `openspec/specs/timetable-navigation/spec.md` — без изменений.

## Verification

- `pnpm typecheck`, `pnpm build` — чисто;
- eslint/prettier по изменённым файлам — чисто (pre-existing ошибка в
  `ResetPasswordModal.tsx` и находки knip существуют на HEAD и не тронуты);
- `vitest run src/shared/helpers/timetable.test.ts` — 15/15.
