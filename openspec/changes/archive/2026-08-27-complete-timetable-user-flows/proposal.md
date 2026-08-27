## Why

The application exposes only part of the generated timetable API: room and lecturer breadcrumbs lead to missing list routes, event filters overwrite each other, event interaction endpoints are unused, and lecturer photos rely on a broken fallback and a hardcoded production URL. Completing the user-facing flows makes the timetable navigable and interactive without introducing administrative controls.

## What Changes

- Add searchable room and lecturer catalog pages and connect the existing detail-page breadcrumbs to them.
- Preserve all active event filters in the URL when one filter changes or is cleared, and restore visible filter values from the URL.
- Expand event details with complete date/time, linked groups, rooms, lecturers, comments, and authenticated visit status controls.
- Allow users to read and submit event comments with explicit author name and text, including loading, empty, validation, success, and failure states.
- Allow authenticated users to mark an event as going, not going, or undecided; unauthenticated users receive a login action instead of an authenticated request.
- Show timetable lecturer photos and allow authenticated users to upload a photo for moderation, with file validation and feedback.
- Replace the rating lecturer photo hostname/fallback stub with timetable API data and a real avatar fallback.
- Add responsive layouts and automated coverage for the new state and URL-filter handling.
- Keep timetable entity CRUD, bulk/repeating event management, comment/photo moderation, deprecated lecturer comments, and favorite-group persistence outside this change.

## Capabilities

### New Capabilities

- `timetable-navigation`: User-facing room, lecturer, event, and schedule navigation, including composable URL filters.
- `timetable-event-interactions`: Event comments and per-user visit decisions.
- `timetable-lecturer-photos`: Lecturer photo display and authenticated photo submission.

### Modified Capabilities

None.

## Impact

- Affects timetable routes and pages under `src/pages/timetable/`, timetable schedule composition, lecturer rating presentation, shared UI/helpers, and authentication-aware TanStack Query calls.
- Uses existing generated operations from `src/shared/api/timetable/`; generated `*.gen.ts` files remain unchanged.
- Uses the existing login session token for secured timetable requests and existing Gravity UI components/tokens for UI.
- Adds no backend endpoints or package dependencies. Backend ownership metadata limitations prevent safe user-facing edit/delete controls for comments and uploaded photos.
