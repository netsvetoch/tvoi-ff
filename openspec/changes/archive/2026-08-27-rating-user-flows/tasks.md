## 1. Review Submission

- [x] 1.1 Add a review form with `-2..2` sliders for kindness/freebie/clarity, optional subject, required text, and anonymous toggle; submit with the session token and verify against the test API that marks outside `-2..2` are impossible and the created comment lands in `PENDING`.
- [x] 1.2 Gate the form behind login (login action for unauthenticated users), show a moderation notice on success, reset the form, and surface localized API errors.

## 2. Comment Reactions

- [x] 2.1 Add like/dislike controls with counts and highlighted active reaction to comment cards; update the lecturer query cache from the mutation response and verify toggling against the test API (new reaction, replace opposite reaction, remove same reaction).
- [x] 2.2 Route unauthenticated reaction clicks to the login page.

## 3. Own Comment Management

- [x] 3.1 Show the author name (`user_fullname`, anonymous fallback) on comment cards and expose edit/delete controls only for the current user's own comments.
- [x] 3.2 Reuse the review form for editing an own comment; after a successful edit inform that the comment returns to moderation, and verify against the test API.
- [x] 3.3 Add a confirmed deletion flow for own comments and verify against the test API.

## 4. Page Wiring

- [x] 4.1 Pass the session token to the lecturer detail query so `is_liked`/`is_disliked` reflect the current user, and keep the page usable when logged out.
- [x] 4.2 Run `pnpm typecheck` and `pnpm lint:all` (typecheck clean; eslint/prettier/dpdm/knip findings are pre-existing and unrelated to this change — the touched files pass all checks).
