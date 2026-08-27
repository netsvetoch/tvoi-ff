## Context

`TimetableSchedule` (`src/widgets/timetable/TimetableSchedule.tsx`) holds `currentDate` and `showedWeekdays` in `useState` and is mounted on four routes (`/timetable/groups/$id`, `/timetable/rooms/$id`, `/timetable/lecturers/$id`, `/timetable/events/`). Routing is `@tanstack/react-router` with hash history; search params are validated per-route via `validateSearch` in `src/app/router.tsx`, read with `useSearch`, and written with `useNavigate` functional `search` updaters (`TimetableEventsPage.tsx` shows the pattern for filter params on `/timetable/events/`). `Schedule.tsx` itself is presentational and does not change.

## Goals / Non-Goals

**Goals:**

- `date`/`days` URL params drive the schedule range on all four pages, with current defaults preserved when params are absent.
- Follow the established TanStack Router search-param patterns exactly (per-route `validateSearch`, functional `search` updaters that merge with existing params).

**Non-Goals:**

- No changes to `Schedule.tsx` props or rendering; no sync of range state across different pages when navigating between them (each page keeps its own params).
- No `start`/`end` param form, no replacing `useMediaQuery`-based default span.

## Decisions

### Anchor + span params (`date`, `days`) instead of explicit `start`/`end`

The range is fully determined by the anchor day and span length using the existing `period` computation. `start`/`end` cannot reconstruct the anchor for the 7-day view (any weekday maps to the same week), so `date`+`days` is the canonical representation. Alternative rejected: syncing only `date` — then a shared URL would not reproduce the span and the 1/3/7 control would stay local.

### State lives in the URL, read via `useSearch({ strict: false })`

`TimetableSchedule` replaces both `useState` calls with:

- Read: `useSearch({ strict: false })` — the documented pattern for components serving multiple routes; returns the union of route search params, so `date`/`days` are `string | undefined` once declared on the four routes.
- Write: `navigate({ to: ".", search: prev => ({ ...prev, date: ... }) })` from `useNavigate()` — the documented way to update search params when `from` is unknown (relative `.` = current route). The functional updater preserves unrelated params (event filters) automatically, matching `TimetableEventsPage.setFilter`.

Alternative rejected: lifting URL sync into the four pages and passing values/handlers down — duplicates the same wiring four times for no type-safety gain.

Alternative rejected: keeping `useState` as the source mirrored into the URL via `useEffect` — two sources of truth, racy on back/forward navigation.

### `validateSearch` declared on each of the four routes

A shared validator (e.g. `scheduleSearchValidation`) applied to `groupRoute`, `eventsIndexRoute` (merged with the existing filter validator), `roomRoute`, and `lecturerRoute`. Params not declared in a matched route's `validateSearch` do not survive navigation, so declaring them on exactly the routes that render the schedule is required and keeps the params off unrelated timetable pages (catalogs, event detail). Alternative rejected: declaring on the parent `timetableRoute` — params would leak to catalog/index pages.

### Helpers in `src/shared/helpers/timetable.ts`

- `parseTimetableDaysParam(value): 1 | 3 | 7 | undefined` — returns the value only for `"1" | "3" | "7"`.
- `parseTimetableDateParam(value): string | undefined` — requires `^\d{4}-\d{2}-\d{2}$` and a parseable real date via `@gravity-ui/date-utils` (`dateTime({ input }).isValid`); returns the normalized string otherwise `undefined`.

Both mirror `parseTimetableEntityId`'s forgiving contract (invalid → `undefined` → default). Unit tests go into the existing `src/shared/helpers/timetable.test.ts`.

`date` uses plain `optionalString` narrowing (dates always parse back as strings — `YYYY-MM-DD` is not valid JSON). `days` is an exception discovered during implementation: TanStack Router's default search serialization is JSON-first, so a string `"3"` is written quoted (`days=%223%22`) while a hand-typed `days=3` parses back as a number and would be dropped by `optionalString`. Therefore `days` is validated directly with `parseTimetableDaysParam` (accepts both `1` and `"1"` forms) and typed `days?: 1 | 3 | 7`, and the widget writes the numeric value — giving a clean `days=3` URL that round-trips and tolerates hand-typed links.

### Defaults and write policy

Absent/invalid `date` → `dateTime()` (today); absent/invalid `days` → `isMobile ? 3 : 7` (current behavior, `useMediaQuery` stays). Params are written only from the arrow/span handlers; defaults are never written back to the URL, so a fresh page keeps a clean URL.

## Risks / Trade-offs

- [Hash URL grows on every arrow click, one history entry per range step] → Intended: history back/forward stepping through ranges is a goal, not a bug.
- [`useSearch({ strict: false })` types are a loose union; `.date`/`.days` access relies on them being declared on at least one route] → They are declared on all four schedule routes; if TS narrows awkwardly, cast through the helper's input type only.
- [`dateTime({ input })` behavior on garbage input may vary] → Helper validates format with a regex first and only then checks `isValid`; the regex prevents malformed input from reaching the parser.
- [React Compiler is enabled] → No manual memoization is added; derived values (`period`) keep the existing `useMemo` since they already exist. No new `useCallback`.

## Migration Plan

Single PR, no data or API migration. Rollback = revert; URLs with `date`/`days` on other versions simply fall back to defaults (invalid/unknown params are ignored by design).
