## 1. Helpers

- [x] 1.1 Add `parseTimetableDaysParam` and `parseTimetableDateParam` to `src/shared/helpers/timetable.ts` (days: only `"1" | "3" | "7"`; date: `^\d{4}-\d{2}-\d{2}$` + real calendar date via `dateTime({ input }).isValid`, never throws) and export them from the helpers index
- [x] 1.2 Add unit tests to `src/shared/helpers/timetable.test.ts` covering valid values, absent/empty values, `days` outside 1/3/7, and non-dates (`2026-13-45`, `27.08.2026`, `abc`); verify with `pnpm test src/shared/helpers/timetable.test.ts`

## 2. Routing

- [x] 2.1 Add a shared `validateSearch` extension for `date`/`days` (`optionalString`) in `src/app/router.tsx` and apply it to `groupRoute`, `eventsIndexRoute` (merged with the existing groupId/lecturerId/roomId validator), `roomRoute`, and `lecturerRoute`; verify with `pnpm typecheck`

## 3. Widget

- [x] 3.1 Replace `currentDate`/`showedWeekdays` `useState` in `src/widgets/timetable/TimetableSchedule.tsx` with URL state: read `date`/`days` via `useSearch({ strict: false })` + new helpers, fall back to today / `isMobile ? 3 : 7`; write via `useNavigate()` with `to: "."` and functional `search` updaters from the arrow and span handlers; verify with `pnpm typecheck`
- [x] 3.2 Verify behavior manually with `pnpm dev` on `/timetable/events/` and a group page: arrows and the 1/3/7 control update `date`/`days` in the hash URL; reload restores the range; back/forward steps through ranges; invalid `date`/`days` fall back to defaults; `groupId`/`lecturerId`/`roomId` params survive range changes and vice versa

## 4. Validation

- [x] 4.1 Run `pnpm lint:all` and `pnpm build` and fix any findings
