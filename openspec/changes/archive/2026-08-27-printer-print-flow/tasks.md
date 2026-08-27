## 1. File Selection

- [x] 1.1 Add a PDF drop zone with file preview and a remove action; validate client-side that the file is non-empty and at most 5 MB, and verify against the test API that only `application/pdf` is accepted (server returns a localized 415 otherwise).

## 2. Print Options

- [x] 2.1 Add page range, copies count (minimum 1, inline validation) and two-sided toggle controls to the printer page form.

## 3. Send Flow

- [x] 3.1 Submit the file in two steps with the profile surname and union-ticket number: request a pin via `POST /file` (with the session token), then upload the file via `POST /file/{pin}`; verify end-to-end against the test API that the terminal can fetch the uploaded file by the returned pin.
- [x] 3.2 Show the pin code with a validity note and a reset action after success; show print service errors as toasts using the `ru` message when available, keeping the form usable after a failure.

## 4. Wiring

- [x] 4.1 Export `checkPrinterAvailable`, `getIsUnionMember`, `getPrinterLoginData` from the printer helpers barrel and switch `router.tsx` to the barrel import; redirect to `/printer/login` when profile data disappears between the guard and submission.
- [x] 4.2 Run `pnpm typecheck` and targeted eslint/prettier on the touched files (clean; remaining `pnpm lint:all` findings are pre-existing and unrelated).
