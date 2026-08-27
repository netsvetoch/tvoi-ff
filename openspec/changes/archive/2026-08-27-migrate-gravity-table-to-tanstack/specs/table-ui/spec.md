# table-ui

## ADDED Requirements

### Requirement: Таблица в стиле Gravity UI на headless TanStack Table

Приложение рендерит табличные данные через headless `@tanstack/react-table` v9,
обёрнутые в общий компонент `GTable` (`src/shared/ui/GTable.tsx`), который
применяет визуал uikit (классы `g-table__*`, токены `--g-*`).

#### Scenario: Кликабельные строки

- **WHEN** компоненту передан `onRowClick`
- **THEN** строки получают класс `g-table__row_interactive` с hover-подсветкой,
  клик по строке вызывает обработчик с инстансом Row

#### Scenario: Сортируемые заголовки

- **WHEN** у колонки разрешена сортировка и зарегистрирован
  `rowSortingFeature`
- **THEN** заголовок кликабелен, рядом индикатор направления
  (невидим до наведения, когда сортировка не активна)

### Requirement: Отсутствие зависимости @gravity-ui/table

Пакет `@gravity-ui/table` отсутствует в зависимостях проекта; все таблицы
используют `@tanstack/react-table`.

#### Scenario: Чистка зависимостей

- **WHEN** выполнен аудит зависимостей (`grep package.json`)
- **THEN** `@gravity-ui/table` не найден, а импорты в `src/` ссылаются только
  на `@tanstack/react-table`
