## Purpose

Let users discuss timetable events and authenticated users record their own attendance decision safely and visibly.

## ADDED Requirements

### Requirement: Event comment feed

The event detail page SHALL display approved event comments with author name, text, and creation time in a deterministic order.

#### Scenario: Event has comments

- **WHEN** approved comments are returned for an event
- **THEN** the page displays each comment's author, text, and creation time

#### Scenario: Event has no comments

- **WHEN** no approved comments are returned
- **THEN** the page displays an explicit empty-comments state

#### Scenario: Comments fail to load

- **WHEN** the comment request fails
- **THEN** the event details remain usable and the comments section offers a retry action

### Requirement: Submit an event comment

The system SHALL let a user submit an event comment with a non-empty author name and non-empty text, SHALL prevent duplicate submission while the request is pending, and SHALL refresh the approved comment feed after success.

#### Scenario: Valid comment submission

- **WHEN** a user submits a valid author name and comment text
- **THEN** the system sends the comment, clears the text after success, and refreshes the comment feed

#### Scenario: Invalid comment submission

- **WHEN** the author name or comment text contains only whitespace
- **THEN** the system does not send a request and identifies the fields that require values

#### Scenario: Comment submission fails

- **WHEN** the timetable API rejects or fails a comment submission
- **THEN** the entered values are retained and the system displays a retryable error

### Requirement: Authenticated visit decision

The system SHALL let an authenticated user view and set their event visit status to `going`, `not_going`, or `no_status`, using the current login session token for secured requests.

#### Scenario: Existing visit status

- **WHEN** an authenticated user opens an event detail page
- **THEN** the system fetches and visibly selects that user's current visit status

#### Scenario: Change visit status

- **WHEN** an authenticated user selects a different visit status
- **THEN** the system saves it and updates the visible selection to the confirmed server response

#### Scenario: Visit status update fails

- **WHEN** saving a visit status fails
- **THEN** the last confirmed status remains selected and the system displays a retryable error

#### Scenario: Unauthenticated user

- **WHEN** an unauthenticated user attempts to use visit controls
- **THEN** the system offers navigation to login and does not issue a secured visit request

### Requirement: Interaction ownership safety

The user interface SHALL NOT expose event comment edit or delete controls until the backend response provides enough ownership information to determine which comments the current user may manage.

#### Scenario: Display comments without ownership metadata

- **WHEN** the comment feed contains no author identity linked to the current session
- **THEN** comments are read-only after submission and no edit or delete controls are displayed
