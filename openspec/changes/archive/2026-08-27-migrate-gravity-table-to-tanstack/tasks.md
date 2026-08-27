# Tasks

## Grounding

- [x] `pnpm dlx @tanstack/intent@latest list` (workspace root)
- [x] Сверить точные экспорты/типы v9: `node_modules/@tanstack/react-table/dist/index.d.ts`
      (`useTable`, `tableFeatures`, `createSortedRowModel`, `FlexRender`,
      `ColumnDef<..., TFeatures>`, generic для обёртки)

## Shared component

- [x] `src/shared/ui/g-table.scss` — правила из uikit Table.css (`g-table__*`,
      hover `row_interactive`, edge-padding, сортируемая шапка)
- [x] `src/shared/ui/GTable.tsx` — рендер таблицы из инстанса v9,
      клик по строке (`row_interactive`), sortable-заголовок с индикатором,
      empty state; фичевые методы через optional call (v9 feature-conditional API)
- [x] Экспорт из `src/shared/ui/index.ts`

## Consumers

- [x] `LecturersTable.tsx`: `manualSorting` + controlled `sorting`,
      features с `rowSortingFeature`; у пустых данных стабильный fallback
- [x] `GroupsTable.tsx`: без сортировки, кнопка избранного — stopPropagation как раньше,
      `row.getValue<T>()` без деструктуризации (потеря `this` в v9)

## Cleanup & verify

- [x] Убрать `@gravity-ui/table` из package.json, обновить lockfile
- [x] `pnpm typecheck && pnpm lint` — чисто по изменённым файлам
      (остались pre-existing ошибки в LoginPage/ResetPasswordModal)
- [x] Визуальная проверка в браузере: groups (182 строки, favorites,
      клик по строке → `#/timetable/groups/:id`), rating (сортировка asc/desc
      с перезапросом, клик по строке → `#/rating/lecturer/:id`)
