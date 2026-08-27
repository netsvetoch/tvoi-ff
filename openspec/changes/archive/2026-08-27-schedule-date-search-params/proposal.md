## Why

The timetable schedule's selected date range (anchor date and 1/3/7-day span) lives only in `TimetableSchedule` component state. The view a user has chosen cannot be shared, bookmarked, or restored after a reload: every visit resets to "today" with a viewport-dependent span, and browser back/forward does not step through visited date ranges.

## What Changes

- Add `date` (`YYYY-MM-DD`, the range anchor) and `days` (`1`, `3`, or `7`, the span length) URL search parameters on the routes that render the schedule: `/timetable/groups/$id`, `/timetable/events/`, `/timetable/rooms/$id`, `/timetable/lecturers/$id`.
- Replace local `useState` in `TimetableSchedule` with URL state: the range controls (arrow buttons and the 1/3/7 segmented control) update the search params; the schedule reads and renders from them.
- Parameters are written only on user interaction. When absent or invalid, behavior falls back to the current defaults: `date` → today, `days` → 3 on mobile / 7 on desktop.
- Existing search params on `/timetable/events/` (`groupId`, `lecturerId`, `roomId`) are preserved when the date range changes, and vice versa.
- Add parsing helpers with unit tests next to the existing `parseTimetableEntityId`.

## Capabilities

### New Capabilities

- `schedule-date-range`: URL-addressable schedule date range — the selected range on timetable schedule pages is represented by `date`/`days` search params, restorable from the URL, resilient to invalid values, and composable with existing event filters.

### Modified Capabilities

<!-- None: adding `validateSearch` entries follows the existing typed-search convention
     in `routing`/`timetable-navigation`; no routing requirement behavior changes. -->

## Impact

- `src/app/router.tsx` — `validateSearch` for `date`/`days` on `groupRoute`, `eventsIndexRoute` (merged with existing filter params), `roomRoute`, `lecturerRoute`.
- `src/widgets/timetable/TimetableSchedule.tsx` — state source swaps from `useState` to search params (`useSearch`/`useNavigate` with `to: "."`).
- `src/shared/helpers/timetable.ts` — new `parseTimetableDateParam`/`parseTimetableDaysParam` helpers; unit tests in `src/shared/helpers/timetable.test.ts`.
- No API, dependency, or `Schedule.tsx` (presentational component) changes.
