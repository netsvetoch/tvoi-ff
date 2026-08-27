# printer-printing Specification

## Purpose

Let authenticated union members send PDF files to the print terminal: choose a file and print options, upload it through the print service, and receive a pin code to enter on the terminal.

## Requirements

### Requirement: Submit a file to the print terminal

The printer page SHALL let an authenticated user select a PDF file, set print options (page range, copies count, two-sided printing), submit the file to the print service together with the surname and union-ticket number stored in the user profile, and SHALL display the resulting pin code for entering it on the print terminal.

#### Scenario: Successful submission

- **WHEN** an authenticated user selects a valid PDF file and submits the form
- **THEN** the system requests a pin from the print service, uploads the file under that pin, and displays the pin code with a validity note

#### Scenario: Start another submission

- **WHEN** the user activates the reset action after a successful submission
- **THEN** the system returns to the empty submission form with default options

#### Scenario: Missing profile data at submission

- **WHEN** the surname or union-ticket number is no longer present in the user profile at submission time
- **THEN** the system redirects the user to the printer login page instead of requesting a pin

#### Scenario: Unauthenticated user

- **WHEN** a logged-out user attempts to submit a file
- **THEN** the system navigates the user to the login page and does not issue print requests

### Requirement: Print file validation

The printer page SHALL accept only non-empty PDF files up to 5 MB, SHALL reject other files before any upload, and SHALL surface the print service's localized error when the server rejects a file or a request fails.

#### Scenario: Empty or oversized file

- **WHEN** the user selects an empty file or a file larger than 5 MB
- **THEN** the system shows a validation message and does not send a request

#### Scenario: Non-PDF file

- **WHEN** the user selects a file that is not a PDF
- **THEN** the system shows a message that only PDF files are supported and does not send a request

#### Scenario: Server rejection

- **WHEN** the print service rejects the file or the pin request
- **THEN** the system shows the localized error from the response when available and keeps the form usable for retry

### Requirement: Printer page availability

The printer page SHALL be reachable only for authenticated users whose surname and union-ticket number are stored in the profile and confirmed by the print service; other users SHALL be routed to the printer login page to verify and save their data.

#### Scenario: Confirmed union member

- **WHEN** an authenticated user with profile data confirmed by the print service opens the printer page
- **THEN** the submission form is displayed

#### Scenario: Unconfirmed or missing data

- **WHEN** an authenticated user lacks profile data or the print service does not confirm it
- **THEN** the system redirects the user to the printer login page

#### Scenario: Printer login saves verified data

- **WHEN** the user submits a surname and union-ticket number that the print service confirms
- **THEN** the system saves both values to the user profile and opens the printer page
