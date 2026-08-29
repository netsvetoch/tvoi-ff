## 1. Хелперы модуля

- [x] 1.1 Создать `src/pages/services/helpers.ts` с `openServiceButton` (inapp → navigate по href, internal → navigate на `/services/$buttonId`, external → `window.open(..., '_blank', 'noopener')`) и хелпером валидации iframe-ссылки (только `internal` + http(s) через `n`); юнит-тесты в `helpers.test.ts` (`pnpm exec vitest run src/pages/services/helpers.test.ts` — как в существующих тестах; проверить фактический раннер)
- [x] 1.2 Проверить типы и линт: `pnpm exec eslint src/pages/services --quiet` и `pnpm typecheck`

## 2. Каталог `/services`

- [x] 2.1 Создать `src/pages/services/ServicesPage.tsx`: запрос `getCategoriesCategoryGetOptions({ auth: token, query: { info: ['buttons'] } })`, рендер категорий и кнопок (иконка через `n(icon, baseUrl)`, плейсхолдер), состояния загрузки/пусто/ошибка по конвенциям rental; лоадер/ошибка проверяются визуально на `pnpm dev`
- [x] 2.2 Правила отображения по `view`: `active` — клик через `openServiceButton`, `blocked` — неактивная кнопка, `hidden` — не рендерится; покрыть юнит-тестом фильтрации/дизейбла в `helpers.test.ts` или тесте компонента, если раннер позволяет
- [x] 2.3 Экспортировать страницу из `src/pages/services/index.ts`

## 3. Страница просмотра `/services/$buttonId`

- [x] 3.1 Создать `src/pages/services/ServiceViewPage.tsx`: `useParams` (strict: false при необходимости), запрос `getServiceServiceButtonIdGetOptions({ auth: token, path: { button_id } })`, крошки «Главная / Сервисы / имя», iframe (sandbox, title, flex-высота) или фолбэк с «Открыть в новой вкладке»; проверить визуально на `pnpm dev`
- [x] 3.2 Экспортировать из `src/pages/services/index.ts`, проверить `pnpm exec eslint src/pages/services --quiet`

## 4. Роутинг и навигация

- [x] 4.1 Зарегистрировать маршруты `servicesRoute` → `/services` (ServicesPage) и `/services/$buttonId` (ServiceViewPage) в `src/app/router.tsx`; проверить переходы по hash-URL `#/services` и `#/services/1`
- [x] 4.2 Добавить пункт «Сервисы» в `items` меню `src/app/Layout.tsx` (иконка из `@gravity-ui/icons`, подсветка по `startsWith("/services")`); проверить десктоп и мобильное бургер-меню

## 5. Верификация

- [x] 5.1 Прогнать `pnpm lint:all` и `pnpm build`; исправить замечания
- [x] 5.2 Ручной прогон сценариев спека против тестового бэкенда: каталог с токеном и без, blocked/hidden, три типа ссылок, просмотр iframe, «Открыть в новой вкладке», крошки
