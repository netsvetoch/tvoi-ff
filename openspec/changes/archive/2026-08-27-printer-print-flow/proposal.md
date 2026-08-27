## Why

The print API client (`src/shared/api/print/`) is fully generated, and the union-member login flow plus route guards already work, but the printer page itself was a stub: an empty form that only logged its data. Users who passed the union-member check had no way to actually send a file to the print terminal. Probing the test backend confirmed the full flow works: `POST /file` issues a pin for a surname + union-ticket number, `POST /file/{pin}` accepts the file (PDF only, server rejects other types and corrupted files), and `GET /file/{pin}` returns the stored file for the terminal.

## What Changes

- Add a PDF drop zone with file preview to the printer page; validate client-side that the file is non-empty and at most 5 MB, and allow removing the selected file.
- Add print options: page range, copies count (minimum 1, with inline validation) and a two-sided toggle.
- Submit the file in two steps using the surname and union-ticket number stored in the user profile: request a pin via `POST /file`, then upload the file via `POST /file/{pin}`.
- After a successful upload, show the pin code for the print terminal with a validity note and a "send another file" reset action.
- Show print service errors as toasts using the localized `ru` message when available.
- Export all printer helpers from the helpers barrel and import them through it.
- Keep terminal admin endpoints (`/admin/*`), union-list updates and instant QR print outside this change (not user-facing here).

## Capabilities

### New Capabilities

- `printer-printing`: User-facing file submission to the print terminal and pin-code display on the printer page.

### Modified Capabilities

None.

## Impact

- `src/pages/printer/`: `PrinterPage.tsx` implemented, helpers barrel exports completed.
- `src/app/router.tsx`: imports `checkPrinterAvailable` from the helpers barrel.
- `src/shared/api/print/` is consumed only; generated files stay untouched.
- No dependency or build changes.
