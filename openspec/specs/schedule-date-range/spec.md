# schedule-date-range Specification

## Purpose

Makes the timetable schedule's selected date range URL-addressable: the anchor day and the 1/3/7-day span are stored in `date`/`days` search params so a schedule view can be shared, bookmarked, and restored, and history navigation steps through visited ranges.

## Requirements

### Requirement: URL-addressable schedule date range

Timetable schedule pages (`/timetable/groups/$id`, `/timetable/rooms/$id`, `/timetable/lecturers/$id`, `/timetable/events/`) SHALL represent the selected date range in URL search parameters: `date` as the range anchor day in `YYYY-MM-DD` form and `days` as the span length `1`, `3`, or `7`. The visible range SHALL match the existing span semantics: 1 day shows `[date, date+1)`, 3 days shows `[date-1, date+2)`, 7 days shows the week (Sunday–Saturday) containing `date`.

#### Scenario: Shift the range with arrows

- **WHEN** a user clicks the previous/next range arrow
- **THEN** the anchor date shifts by the current span length and the URL `date` parameter updates accordingly

#### Scenario: Switch the span

- **WHEN** a user selects 1, 3, or 7 days in the span control
- **THEN** the URL `days` parameter updates to that value and the visible range changes

#### Scenario: Restore a range from URL

- **WHEN** a schedule page opens with a valid `date` (and optionally `days`) in its URL, e.g. from a shared link or a page reload
- **THEN** the schedule displays exactly that range instead of resetting to the current date

#### Scenario: History navigation

- **WHEN** a user moves back or forward in browser history after changing the range
- **THEN** the previously selected range is restored from the URL

### Requirement: Fallbacks for absent or invalid range parameters

The system SHALL write `date`/`days` parameters only in response to user interaction and SHALL fall back to the pre-existing defaults when a parameter is absent or invalid: `date` falls back to the current day, `days` falls back to 3 days on mobile-width and 7 days on desktop-width viewports. An invalid value MUST NOT break the page.

#### Scenario: Open without parameters

- **WHEN** a schedule page opens with no `date`/`days` parameters
- **THEN** the schedule shows the current date with the viewport-default span and the URL stays clean

#### Scenario: Ignore invalid values

- **WHEN** the URL contains a `date` that is not a real calendar date in `YYYY-MM-DD` form, or a `days` value outside `1`/`3`/`7`
- **THEN** the invalid parameter is ignored and its default applies while the other (valid) parameter is still honored

### Requirement: Composability with event filters

On the events page, changing the date range SHALL preserve the `groupId`, `lecturerId`, and `roomId` filter parameters, and changing a filter SHALL preserve the `date`/`days` parameters.

#### Scenario: Change range with filters active

- **WHEN** a user changes the date range while event filters are active in the URL
- **THEN** the filter parameters remain in the URL and the schedule keeps applying them to the new range

#### Scenario: Change filter with a custom range active

- **WHEN** a user changes or clears an event filter while a custom date range is in the URL
- **THEN** the `date`/`days` parameters remain and the visible range is unchanged
