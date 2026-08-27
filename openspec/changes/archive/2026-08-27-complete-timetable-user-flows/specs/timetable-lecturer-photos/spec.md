## Purpose

Display lecturer imagery from the timetable service and let authenticated users contribute valid photos for moderation.

## ADDED Requirements

### Requirement: Lecturer photo display

The system SHALL obtain lecturer photos from timetable API data and SHALL not construct photo URLs with a hardcoded production host.

#### Scenario: Lecturer has photos

- **WHEN** the timetable API returns one or more approved photos for a lecturer
- **THEN** the lecturer timetable page displays the photos and the linked rating page uses an approved photo as its avatar

#### Scenario: Lecturer has no photo

- **WHEN** no approved lecturer photo is available or an image fails to load
- **THEN** the system displays the existing name-based avatar fallback without requesting a placeholder string as an image URL

#### Scenario: Photos fail to load

- **WHEN** the lecturer photo request fails
- **THEN** lecturer details and schedule remain usable with the avatar fallback

### Requirement: Authenticated lecturer photo submission

The lecturer timetable page SHALL let an authenticated user submit a non-empty image file to the timetable service and SHALL communicate that a successful upload is pending moderation.

#### Scenario: Submit a valid photo

- **WHEN** an authenticated user selects a supported image file and submits it
- **THEN** the system uploads the file with the current login session token and displays a moderation-pending confirmation

#### Scenario: Reject an invalid file

- **WHEN** a user selects an empty file or a file whose declared type is not an image
- **THEN** the system does not upload the file and displays a validation message

#### Scenario: Photo upload fails

- **WHEN** the timetable API rejects or fails the upload
- **THEN** the selected file remains available for retry and the system displays a retryable error

#### Scenario: Unauthenticated upload attempt

- **WHEN** an unauthenticated user attempts to add a lecturer photo
- **THEN** the system offers navigation to login and does not issue an upload request

### Requirement: Photo ownership safety

The user interface SHALL NOT expose photo deletion controls until the backend response provides enough ownership information to determine which photos the current user may delete.

#### Scenario: Display photos without ownership metadata

- **WHEN** approved photo data contains no uploader identity linked to the current session
- **THEN** photos are displayed without user-facing delete controls
