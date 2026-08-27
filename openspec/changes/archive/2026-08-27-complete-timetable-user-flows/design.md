## Context

See `proposal.md` for motivation. The application already has generated Hey API SDK and TanStack Query option factories for all required timetable operations. Existing read-only timetable pages call those factories directly, login data is stored by `useLoginData`, and other authenticated features pass `auth: token` per request. Generated API files must not be edited.

The timetable API has important contract constraints:

- comment reads and creates are public, while event visit status and lecturer photo uploads require an authorization token;
- approved comment and photo responses do not contain a current-user ownership identifier;
- lecturer comment endpoints are deprecated and rating comments are owned by a separate service;
- rating lecturer records expose `timetable_id`, which is the join key for timetable photos.

## Goals / Non-Goals

**Goals:**

- Keep server state in TanStack Query and URL-addressable filter state in the router.
- Reuse a small set of timetable-specific presentation components across detail and rating pages.
- Make authenticated requests explicit and prevent secured queries from running without a token.
- Preserve event details when secondary interactions fail.

**Non-Goals:**

- Introduce a global API authentication interceptor or change generated clients.
- Add optimistic updates where the server response is the authority.
- Infer comment or photo ownership from display names, timestamps, or local state.
- Replace the static map geometry or local favorite-group storage; the timetable API has no equivalent data model.

## Decisions

### Use explicit per-call authentication

Visit queries/mutations and photo uploads will receive `auth: token` from `useLoginData`, matching established application behavior. Secured queries will use `enabled: Boolean(token)` and unauthenticated actions will route to login.

Alternative considered: configure authentication globally on the generated timetable client. This would couple generated client lifecycle to local storage, differ from every existing service integration, and risk sending stale credentials.

### Keep each filter in a controlled URL parameter

Filter updates will clone the current `URLSearchParams`, set or delete exactly one key, and retain the other keys. Select values will be controlled from validated URL values so browser navigation and shared URLs reproduce the same state. A small pure helper will own parsing/updating and receive unit coverage.

Alternative considered: component-local filter state synchronized by an effect. This creates two sources of truth and makes back/forward behavior fragile.

### Build catalogs with the existing shared table

Room and lecturer catalogs will follow the groups-page composition and render through `GTable`, with local text filtering over fetched catalog data and row navigation to details. Shared formatting helpers will normalize searchable lecturer names and nullable room building data.

Alternative considered: introduce server-paginated tables. The current groups and filter selectors already load complete reference lists, and pagination would add a new interaction model beyond this change.

### Isolate event interactions from event details

Comments and visit status will be separate sections/components with independent queries, error boundaries, and pending states. Comment success invalidates the event-comment query key. Visit mutation success writes or invalidates the current-user visit query; failure leaves the last server-confirmed selection visible.

Alternative considered: combine event, comments, and visit state in one page query. The API exposes separate endpoints with different authentication and failure modes, so a combined request would make the whole page less resilient.

### Intersect combined event filters on the client

The deployed timetable API accepts exactly one of `group_id`, `lecturer_id`, or `room_id` per event-list request despite the generated contract marking all three optional. The schedule will run one query per active URL filter and intersect successful result sets by event ID. With no active filter it will show a selection prompt instead of issuing a request that is guaranteed to fail.

Alternative considered: keep only the most recently selected filter. That would silently discard the composable filter behavior and make shared URLs misleading.

### Keep anonymous comments explicit and read-only

The comment form will ask for `author_name` and `text`, trim both before submission, and retain input on failure. Existing comments will not expose edit/delete actions because the API does not return an author user ID and update is public while delete merely requires any token.

Alternative considered: allow controls on comments created during the current browser session. That local heuristic would fail after refresh and does not prove backend ownership.

### Treat photo uploads as moderation submissions

Approved photos will come from `getLecturerPhotos...`; uploads will use the generated multipart mutation after client-side non-empty/image MIME validation. Upload success will show a moderation-pending notice rather than inserting the response into the approved gallery. No delete action will be exposed without ownership metadata.

The rating page will query photos with the rating lecturer's `timetable_id`. A shared resolver will accept absolute API links and safely resolve relative links against the configured timetable API origin, eliminating environment-specific host literals. Image load errors fall back to the existing initials avatar.

Alternative considered: continue using `avatar_link` from the rating response. Its current rendering depends on a hardcoded production origin and does not exercise the timetable photo contract.

### Use existing feedback and validation primitives

Gravity UI controls, alerts/toasts, skeletons, and responsive Flex layouts will provide loading, validation, success, empty, and retry states. No new package will be added. New UI styles will use Gravity CSS tokens and avoid fixed-width mobile overflow.

## Risks / Trade-offs

- [Reference lists may become large] -> Keep query limits bounded to a documented high value and local filtering simple; server pagination can be introduced under a separate capability if payload size becomes material.
- [The API accepts comments without authentication] -> Clearly label the author field and do not imply verified identity.
- [Comment moderation may delay visibility] -> Refresh after submission but also explain that a successfully submitted comment may await moderation.
- [Photo links may be absolute or relative] -> Normalize links through one tested resolver and reject unsupported URL schemes.
- [A login token can expire during mutation] -> Preserve user input/status, surface the API failure, and offer login rather than clearing local session data implicitly.
- [The API has no explicit upload size limit] -> Validate file presence and MIME type client-side, leaving authoritative size enforcement and error messaging to the service.

## Migration Plan

1. Add pure URL and asset-link helpers with tests.
2. Add catalog routes/pages and correct event filter behavior without removing existing detail routes.
3. Add event and lecturer interaction sections incrementally behind their existing detail pages.
4. Switch the rating avatar to timetable photo data after the shared photo path is verified.
5. Validate authenticated and unauthenticated flows against the test API, then run full static validation and production build.

Rollback consists of reverting the hand-written route/page/helper changes. No persisted application data, generated client output, or backend schema is migrated.
