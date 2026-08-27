# timetable-navigation

## Purpose

Provide complete, responsive navigation through timetable entities and predictable URL-addressable schedule filtering.

## Requirements

### Requirement: Room catalog

The system SHALL provide a room catalog at `/timetable/rooms` that can be searched by room name or building and from which a user can open a room's timetable.

#### Scenario: Open a room timetable

- **WHEN** a user selects a room from the room catalog
- **THEN** the system navigates to `/timetable/rooms/{roomId}` and displays that room's schedule

#### Scenario: Search rooms

- **WHEN** a user enters a room name or building in the room search
- **THEN** the catalog displays only matching rooms and shows an empty state when there are no matches

### Requirement: Lecturer catalog

The system SHALL provide a lecturer catalog at `/timetable/lecturers` that can be searched by any part of a lecturer's name and from which a user can open a lecturer's timetable.

#### Scenario: Open a lecturer timetable

- **WHEN** a user selects a lecturer from the lecturer catalog
- **THEN** the system navigates to `/timetable/lecturers/{lecturerId}` and displays that lecturer's schedule

#### Scenario: Search lecturers

- **WHEN** a user enters part of a lecturer's first, middle, or last name
- **THEN** the catalog displays only matching lecturers and shows an empty state when there are no matches

### Requirement: Composable event filters

The event schedule SHALL represent room, group, and lecturer filters in URL query parameters and SHALL preserve unrelated filters when one filter changes.

#### Scenario: Combine filters

- **WHEN** a user selects a room while a group or lecturer filter is active
- **THEN** the room filter is added without removing the existing filters and the schedule applies all active filters

#### Scenario: Clear one filter

- **WHEN** a user clears one event filter
- **THEN** only that filter is removed from the URL and the remaining filters stay active

#### Scenario: Restore filters from URL

- **WHEN** the events page opens with valid filter identifiers in its URL
- **THEN** each corresponding selector displays the selected value and the schedule uses those identifiers

#### Scenario: Ignore invalid filters

- **WHEN** a URL filter value is absent, empty, or not a positive numeric identifier
- **THEN** the system does not send that value to the timetable API and keeps the page usable

### Requirement: Complete event details

The event detail page SHALL display the event name, start and end date/time, linked groups, linked rooms, and linked lecturers.

#### Scenario: Follow an event relation

- **WHEN** a user selects a linked group, room, or lecturer on an event
- **THEN** the system opens the corresponding timetable detail page

#### Scenario: Event cannot be loaded

- **WHEN** event details fail to load or the identifier is invalid
- **THEN** the page displays a recoverable error or not-found state instead of incomplete event content

### Requirement: Responsive timetable navigation

The new catalogs, filters, and details SHALL remain usable at mobile and desktop viewport sizes.

#### Scenario: Use event filters on a narrow viewport

- **WHEN** the events page is displayed at a mobile viewport width
- **THEN** filter controls reflow without horizontal page overflow and remain individually operable
