# rating-interactions

## Purpose

Let authenticated users participate in the lecturer rating ("Дубинушка"): submit moderated reviews, react to approved comments, and manage their own approved comments.

## Requirements

### Requirement: Submit a lecturer review

The lecturer rating page SHALL let an authenticated user submit a review with integer kindness, freebie and clarity marks from -2 to 2, an optional subject, required non-empty text, and an optional anonymous flag, and SHALL inform the user that the review appears after moderation.

#### Scenario: Valid review submission

- **WHEN** an authenticated user submits non-empty text with marks in range
- **THEN** the system creates the review, resets the form, and shows a moderation notice

#### Scenario: Empty review text

- **WHEN** the review text contains only whitespace
- **THEN** the system does not send a request and marks the text field as invalid

#### Scenario: Unauthenticated user

- **WHEN** a logged-out user opens the lecturer rating page
- **THEN** the review form is replaced with a login action

#### Scenario: Submission failure

- **WHEN** the review creation request fails
- **THEN** the system keeps the entered values and shows the localized API error when available

### Requirement: Comment reactions

The lecturer rating page SHALL let an authenticated user toggle a like or a dislike on each approved comment, SHALL display reaction counts and the current user's active reaction, and SHALL refresh displayed counts without a full reload.

#### Scenario: Toggle a reaction

- **WHEN** the user clicks like or dislike on a comment
- **THEN** the system sends the reaction request and updates counts and the active-reaction highlight from the server response

#### Scenario: Unauthenticated reaction

- **WHEN** a logged-out user clicks a reaction control
- **THEN** the system navigates the user to the login page

### Requirement: Comment author display

Each comment card SHALL display the author name returned by the API, falling back to an anonymous label when the author is unknown.

#### Scenario: Named author

- **WHEN** a comment has a non-empty author name
- **THEN** the card displays that name instead of the numeric user id

#### Scenario: Anonymous author

- **WHEN** a comment has no author name
- **THEN** the card displays an anonymous label

### Requirement: Manage own comments

The lecturer rating page SHALL let the current user edit and delete their own approved comments and SHALL NOT expose these controls on other users' comments.

#### Scenario: Edit own comment

- **WHEN** the current user edits their own comment and submits valid values
- **THEN** the system updates the comment and informs the user that it returns to moderation

#### Scenario: Delete own comment

- **WHEN** the current user confirms deletion of their own comment
- **THEN** the system deletes the comment and refreshes the comment feed

#### Scenario: Delete confirmation declined

- **WHEN** the current user declines the deletion confirmation
- **THEN** no delete request is sent
