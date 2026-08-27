## Why

The rating API client is generated in full, but the app only reads lecturer lists and lecturer details with approved comments. All interactive endpoints — creating a review, reacting to comments, editing and deleting own comments — are unwired, and comment cards show a raw numeric `user_id` instead of the author name returned by the API. Probing the test backend confirmed these endpoints work: marks are integers `-2..2`, new comments are created in `PENDING` moderation, likes/dislikes toggle and return the updated comment, and owners can edit (returns to moderation) or delete their approved non-anonymous comments.

## What Changes

- Add a review submission form to the lecturer rating page with `-2..2` sliders for kindness, freebie and clarity, optional subject, required text and an anonymous toggle; unauthenticated users get a login action instead of the form.
- After successful submission, inform the user that the review appears after moderation.
- Add like/dislike reaction controls with counts to comment cards; the current user's active reaction is highlighted, and unauthenticated clicks lead to login.
- Show the comment author name (`user_fullname`) instead of the numeric `user_id`.
- Let the current user edit and delete their own approved comments directly from the comment feed; editing re-submits the comment to moderation, deletion requires confirmation.
- Pass the session token to the lecturer detail query so per-user reaction flags are available.
- Keep lecturer/comment moderation, import, and lecturer CRUD outside this change (administrative surface).

## Capabilities

### New Capabilities

- `rating-interactions`: User-facing review submission, comment reactions, and own-comment management on the lecturer rating page.

### Modified Capabilities

None.

## Impact

- `src/pages/rating/`: lecturer rating page, comment card, new review form and related exports.
- `src/shared/api/rating/` is consumed only; generated files stay untouched.
- No dependency, routing, or build changes.
