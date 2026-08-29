## 1. Разрешение URL картинок

- [x] 1.1 Добавить обобщённый `resolveServiceAssetUrl(link, baseUrl)` в `src/shared/helpers` и переопределить `resolveTimetablePhotoUrl` через него; проверить, что существующие тесты `resolveTimetablePhotoUrl` проходят (`pnpm exec vitest run src/shared/helpers/timetable.test.ts`), и добавить тесты на новый хелпер.

## 2. Карточка собственных достижений (aside)

- [x] 2.1 Переработать карточку «Достижения» в `ProfilePage`: показывать все достижения (включая без картинок) с названием и описанием, картинки по абсолютному URL из 1.1 (база из `client.getConfig().baseUrl` achievement-клиента); проверить рендер при пустом списке и при загрузке (скелетон) в `pnpm dev`.

## 3. Секция управления достижениями

- [x] 3.1 Добавить секцию «Достижения» в основной контент профиля: каталог из `getAllAchievementsAchievementGetOptions({ auth: token })` карточками (картинка, название, описание, владелец), состояния загрузки/ошибки/пустого списка; проверить в `pnpm dev` под залогиненным пользователем.
- [x] 3.2 Реализовать диалог создания/редактирования достижения (`createAchievementAchievementPostMutation` / `editAchievementAchievementIdPatchMutation`) с предзаполнением при редактировании и клиентской валидацией непустого названия; проверить успех-тост и инвалидацию каталога и собственных достижений.
- [x] 3.3 Реализовать подтверждение и удаление достижения (`deleteAchievementAchievementIdDeleteMutation`, `Dialog.Footer preset="danger"`); проверить, что отмена не отправляет запрос, а удаление убирает карточку из каталога.
- [x] 3.4 Реализовать загрузку картинки (`uploadPictureAchievementIdPicturePatchMutation`, `FileDropZone` + `FilePreview`, валидация непустого `image/*`); проверить, что после загрузки в каталоге отображается обновлённая картинка.
- [x] 3.5 Реализовать диалог получателей: список из `getAllRecieversAchievementAchievementIdRecieverGetOptions` (лениво, при открытии), выдача по числовому `user_id` (`createRecieverAchievementAchievementIdRecieverUserIdPostMutation`) и отзыв (`revokeRecieverAchievementAchievementIdRecieverUserIdDeleteMutation`); проверить обновление списка получателей без перезакрытия диалога.
- [x] 3.6 Добавить разбор ошибок сервера (`ru` / `detail` строка и массив / «Неизвестная ошибка») в тосты всех мутаций секции; проверить на аккаунте без прав `achievements.achievement.*`, что показывается текст сервера, а состояние каталога не ломается.

## 4. Проверка

- [x] 4.1 Прогнать полную валидацию: `pnpm lint:all` и `pnpm build` проходят без ошибок.
- [x] 4.2 Пройти сценарии спеки `profile-achievements` в `pnpm dev` под тестовым аккаунтом и убедиться, что каждый эндпоинт `src/shared/api/achievement/` покрыт интерфейсом (каталог, создание, редактирование, удаление, картинка, получатели, выдача, отзыв, собственные достижения).
