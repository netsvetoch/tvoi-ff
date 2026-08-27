# Migration: @gravity-ui/table → @tanstack/react-table + uikit table styles

## Why

Убрать зависимость от обёртки `@gravity-ui/table` (TanStack Table v8) и работать
с headless `@tanstack/react-table@9` напрямую. Визуал таблиц остаётся
«гравити» — воспроизводим стили компонента `Table` из `@gravity-ui/uikit`
(классы `.g-table__*` на токенах `--g-*`, которые уже загружены через
`styles.css`). CSS этих классов не экспортируется публично (`./styles/*`
не содержит table), поэтому стили копируются в проект одним файлом.

## Scope

Только два потребителя:

- `src/pages/rating/ui/LecturersTable.tsx` — серверная сортировка (`manualSorting`),
  кликабельные строки, пагинация вне таблицы;
- `src/pages/timetable/groups/ui/GroupsTable/GroupsTable.tsx` — статичная таблица,
  кликабельные строки, кнопка «избранное» в ячейке.

Новый общий компонент:

- `src/shared/ui/GTable.tsx` (+ `g-table.scss`) — презентационная обёртка:
  принимает инстанс tanstack-таблицы, рисует `<table class="g-table__table">…`
  со структурой uikit (`head/body/row/cell`, `row_interactive`, edge-padding);
  сам сортируемые заголовки оборачивает в кнопку с треугольным индикатором
  сортировки (как у `BaseSort/BaseSortIndicator` в gravity/table);
  пропсы: `table`, `className`, `onRowClick`.

## Key decisions

1. TanStack **v9** API: `useTable({features, columns, data})`,
   `tableFeatures({rowSortingFeature, sortedRowModel: createSortedRowModel()})`
   для LecturersTable; GroupsTable без фич сортировки.
   Типы: `ColumnDef<typeof features, TData, TValue>`.
2. Стили — копия правил uikit `components/Table/Table.css` в
   `src/shared/ui/g-table.scss` на `--g-*` токенах + модификатор размера
   `_size_s` (обе текущие таблицы использовали `size="s"`).
3. `@gravity-ui/table` удаляется из `package.json`.
4. Props API текущих страниц сохранён (search/pagination/favorites) — меняется
   только внутренняя механика таблиц.

## Non-goals

- Виртуализация, selection, reordering, resizing (не используются).
- Переход остальных таблиц проекта (их нет).
- Пиксель-в-пиксель повторение gravity/table drag-and-drop нюансов.
