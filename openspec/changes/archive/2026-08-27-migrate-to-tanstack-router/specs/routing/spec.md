# routing

## ADDED Requirements

### Requirement: Роутинг на @tanstack/react-router

Приложение использует `@tanstack/react-router` с code-based деревом
маршрутов (`src/app/router.tsx`: `createRootRoute`/`createRoute`/
`createRouter`) и hash-историей (`createHashHistory`). Публичные URL
не содержат именованных параметров кроме сегментов пути: детальные
страницы используют общий сегмент `$id`.

#### Scenario: Хеш-URL сохраняются

- WHEN приложение открывает любой маршрут
- THEN URL использует hash-историю (`/#/timetable/groups` и т.п.),
  как и до миграции с `createHashRouter`

#### Scenario: Неизвестный путь

- WHEN пользователь открывает путь, не совпадающий ни с одним маршрутом
- THEN рендерится корневой Layout с пустой областью контента
  (`notFoundComponent` корня), без полноэкранной страницы «Not Found»

#### Scenario: Типобезопасная навигация

- WHEN вызывается `navigate`/`useNavigate` или `useParams`/`useSearch`
- THEN пути и параметры проверяются на этапе компиляции через
  module augmentation `Register` в `src/app/main.tsx`; компоненты,
  обслуживающие несколько маршрутов (карта этажей), используют
  `strict: false`

### Requirement: Отсутствие зависимости react-router

Пакет `react-router` (и `react-router-dom`) отсутствует в зависимостях
проекта; весь роутинг-код импортируется из `@tanstack/react-router`.

#### Scenario: Чистка зависимостей

- WHEN проверяется `package.json` и импорты приложения
- THEN `react-router` не значится в зависимостях, а в `src/` нет
  импортов из `react-router`/`react-router-dom`
