## 1. Shared Timetable Behavior

- [x] 1.1 Add pure helpers for validating/updating timetable filter query parameters and verify unit tests cover combining, clearing, restoring, and invalid identifiers.
- [x] 1.2 Add a safe timetable photo-link resolver and avatar fallback behavior and verify unit tests cover absolute, relative, missing, and unsupported links.

## 2. Catalogs And Navigation

- [x] 2.1 Implement searchable room and lecturer tables with loading and empty states using `GTable`, and verify search matches all specified fields and row clicks open detail routes.
- [x] 2.2 Add room and lecturer index routes/exports and verify existing detail breadcrumbs no longer target missing routes.
- [x] 2.3 Make event selectors controlled by composable URL parameters and responsive on narrow screens, and verify combined filters survive individual updates, clearing, reload, and browser navigation.
- [x] 2.4 Complete event details with date/time and linked groups, rooms, and lecturers plus invalid/error states, and verify every relation opens its corresponding timetable page.

## 3. Event Interactions

- [x] 3.1 Implement the event comment feed with loading, deterministic display order, empty, failure, and retry states, and verify a comment API failure does not hide event details.
- [x] 3.2 Implement trimmed author/text comment submission with validation, pending protection, success invalidation, moderation feedback, and retained input on failure; verify all form states against the test API.
- [x] 3.3 Implement authenticated visit-status query and mutation controls with explicit token passing, confirmed-server state, login action, and retryable errors; verify no secured request runs without a token.
- [x] 3.4 Verify event comments expose no edit/delete controls while the API lacks ownership metadata.

## 4. Lecturer Photos

- [x] 4.1 Add an approved-photo gallery and fallback to the lecturer timetable detail page, and verify the schedule remains usable when photos are empty, invalid, loading, or failed.
- [x] 4.2 Add authenticated image upload with file validation, explicit token passing, pending protection, moderation confirmation, login action, and retryable failure; verify no upload runs for invalid files or unauthenticated users.
- [x] 4.3 Replace the rating lecturer's hardcoded photo URL and placeholder with a timetable photo query keyed by `timetable_id`, and verify both approved-photo and initials-fallback rendering.
- [x] 4.4 Verify lecturer photos expose no delete controls while the API lacks ownership metadata.

## 5. Verification And Completion

- [x] 5.1 Format changed files and run targeted unit tests plus targeted ESLint, resolving all failures.
- [x] 5.2 Run `pnpm typecheck`, `pnpm lint:all`, and `pnpm build`, resolving all failures caused by this change.
- [x] 5.3 Exercise room/lecturer catalogs, composable event filters, event comments, visit status, lecturer photos, upload, login prompts, and mobile/desktop layouts in the browser against the test API; record that no supplied credentials or tokens were persisted in repository files or logs.
- [x] 5.4 Merge the three timetable delta specs into `openspec/specs/`, archive the completed change, and verify final OpenSpec validation succeeds.

## Verification Notes

- The test API rejects photo uploads from the supplied regular-user session with `Not authorized`; the authenticated request, invalid/unauthenticated guards, retry state, and synthetic successful moderation response were verified without creating a photo.
- `pnpm lint:all` reaches only pre-existing failures outside this change; targeted ESLint and Prettier, type checking, tests, and the production build pass for the changed code.
- Repository content was checked for persisted credentials and JWTs; none were found. The authenticated browser session was closed after QA.
