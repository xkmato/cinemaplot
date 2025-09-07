# Tasks

This file tracks the implementation of features and tasks for the Cinemaplot project. Each task below has been reformatted to match the structure used in `TASKS.md` (ID, Status, Assignee, Context, Goal, Subtasks, Acceptance criteria, Ways of Testing, Files likely to change, Done checklist).

---

### Task 1: Develop JavaScript SDK for Web Integration
ID: F1-001
Status: Open
Assignee: Unassigned

Context: Create a lightweight JavaScript SDK so third-party sites can embed the Cinemaplot bookmark widget via a script tag and simple init call. Use existing Firebase backend where applicable.

Goal: Provide an embeddable SDK that initializes with minimal options and renders a bookmark button for a given movie on-page.

Subtasks:
- Design a small public API: init({ apiKey, movieId, container }) and methods for render(), toggleBookmark(), isBookmarked().
- Implement SDK bundle (UMD/ESM) that can be loaded via script tag.
- Wire API calls to existing backend (use existing Firestore / Next API routes when available).
- Add runtime checks and graceful failures for missing params.
- Add unit tests (Jest) for SDK methods and a simple sample HTML integration test.

Acceptance Criteria:
- SDK can be loaded via script tag without runtime errors.
- init accepts apiKey, movieId, and container and renders a bookmark button in the container.
- Bookmark actions call the backend API and update UI state.

Ways of Testing:
- Unit tests for SDK functions using Jest.
- Manual integration test with a sample HTML page.

Files likely to change:
- New `packages/sdk/` or `scripts/sdk/` source files
- Next.js API routes under `app/api` (if wiring is needed)
- Tests under `__tests__/` or a new test harness for the sample page

Done checklist:
- [ ] API surface designed
- [ ] SDK bundle implemented
- [ ] Backend calls wired
- [ ] Tests added and passing

---

### Task 2: Implement User Authentication in SDK
ID: F1-002
Status: Open
Assignee: Unassigned

Context: The SDK must ensure bookmark actions are performed by authenticated users; rely on the existing Firebase Auth integration used by the main app.

Goal: Add authentication checks in the SDK and fail gracefully with clear errors when unauthenticated.

Subtasks:
- Validate apiKey on initialization.
- Detect existing Firebase Auth session or expose a hook to accept a JWT/session token.
- Surface helpful error messages for unauthenticated flows.
- Add tests that mock authenticated and unauthenticated scenarios.

Acceptance Criteria:
- SDK validates apiKey during init.
- Bookmark actions require a valid user session.
- SDK returns a clear error or prompts auth flow when unauthenticated.

Ways of Testing:
- Unit tests mocking auth states.
- Manual test: attempt bookmark with and without authentication.

Files likely to change:
- SDK auth helpers in `packages/sdk/`
- Possible small API changes to validate keys in `app/api`

Done checklist:
- [ ] apiKey validation
- [ ] Auth detection implemented
- [ ] Error handling added
- [ ] Tests added

---

### Task 3: Create Bookmark Creation API Endpoint
ID: F1-003
Status: Open
Assignee: Unassigned

Context: Provide a server-side endpoint to create bookmarks (Next.js API or server function) storing them in Firestore.

Goal: Implement POST /api/v1/bookmarks that accepts movieId and userId (or uses auth) and creates a bookmark record.

Subtasks:
- Add POST route handler with input validation.
- Use Firestore (or existing DB layer) to persist bookmark with timestamps and metadata.
- Return 201 with the created bookmark ID on success and 400 on validation failures.
- Add unit/integration tests for happy path and validation errors.

Acceptance Criteria:
- Endpoint accepts POST with movieId and userId (or auth) and returns 201 + bookmark ID.
- Invalid input returns 400 with errors.
- Bookmark stored with expected fields in Firestore.

Ways of Testing:
- Unit tests for handler logic.
- Integration tests using curl/Postman or test harness.

Files likely to change:
- `app/api/v1/bookmarks/route.ts` (or similar)
- Firestore rules/validation helpers
- Tests under `__tests__/` or integration suite

Done checklist:
- [ ] Route implemented
- [ ] Validation added
- [ ] Persistence verified
- [ ] Tests added

---

### Task 4: Create Bookmark Retrieval API Endpoint
ID: F1-004
Status: Open
Assignee: Unassigned

Context: Users need an API to retrieve their bookmarks; support pagination for long lists.

Goal: Implement GET /api/v1/bookmarks/{userId} returning a JSON array of bookmarks with movie details.

Subtasks:
- Add GET route handler that queries Firestore for user's bookmarks.
- Join or enrich with movie metadata where necessary.
- Implement pagination (limit, cursor) parameters.
- Add tests for empty results, single page, and paginated responses.

Acceptance Criteria:
- GET returns JSON array of bookmarks (empty array if none).
- Pagination params work and responses include paging token/metadata.

Ways of Testing:
- Unit tests for query logic.
- Integration tests hitting the endpoint and verifying response shapes.

Files likely to change:
- `app/api/v1/bookmarks/[userId]/route.ts` (or similar)
- Test files

Done checklist:
- [ ] GET route implemented
- [ ] Pagination supported
- [ ] Tests added

---

### Task 5: Develop Android SDK
ID: F1-005
Status: Open
Assignee: Unassigned

Context: Provide an Android library (AAR) that apps can include to show a bookmark button and interact with Cinemaplot APIs.

Goal: Deliver a Kotlin library with a `CinemaplotBookmarkButton` UI element and API wiring.

Subtasks:
- Scaffold Android library project and sample app.
- Implement the bookmark button view and lifecycle handling.
- Add network layer for API calls and auth integration.
- Provide unit tests and an example app demonstrating usage.

Acceptance Criteria:
- Library builds as an AAR and exposes `CinemaplotBookmarkButton`.
- API calls function and sample app demonstrates integration.

Ways of Testing:
- Unit tests in Android module.
- Run sample app in emulator to verify UI and API.

Files likely to change:
- New `android/sdk/` module (outside JS workspace or documented as separate repo)
- Sample app

Done checklist:
- [ ] Android library scaffolded
- [ ] UI implemented
- [ ] API wiring complete
- [ ] Sample app added and tested

---

### Task 6: Develop iOS SDK
ID: F1-006
Status: Open
Assignee: Unassigned

Context: Provide an iOS framework that apps can use to embed the bookmark button and call APIs.

Goal: Deliver a Swift framework with a `CinemaplotBookmarkButton` view and networking.

Subtasks:
- Scaffold Swift package or framework and example Xcode project.
- Implement the bookmark view and network/auth helpers.
- Add unit tests and sample integration in example app.

Acceptance Criteria:
- Framework builds and exposes the bookmark view.
- Sample Xcode project demonstrates integration and API calls.

Ways of Testing:
- Unit tests and running the sample app in Simulator.

Files likely to change:
- New `ios/sdk/` project (could be a separate repo/module)
- Example Xcode project

Done checklist:
- [ ] iOS framework scaffolded
- [ ] View & networking implemented
- [ ] Sample app added

---

### Task 7: Implement Email Reminder System
ID: F1-007
Status: Open
Assignee: Unassigned

Context: Send a reminder email (HTML) 24 hours after bookmarking, using Mailgun or existing email service.

Goal: Schedule and send reminder emails containing movie poster, links, and unsubscribe options.

Subtasks:
- Add scheduling logic (delayed job / cloud function / cron) to send emails 24h after bookmark creation.
- Create HTML email templates including poster and CTA buttons.
- Integrate with Mailgun (or existing `email-service.ts`).
- Respect unsubscribe and user preferences.
- Add tests for scheduling and template rendering.

Acceptance Criteria:
- Emails are queued/sent ~24h after bookmark creation.
- Emails include poster, links, and unsubscribe action.
- Delivery via Mailgun or configured email provider.

Ways of Testing:
- Unit tests for template rendering.
- Integration test sending via Mailgun sandbox.

Files likely to change:
- `lib/email-service.ts` or `lib/notification-email-service.ts`
- Templates under `docs/` or `templates/`

Done checklist:
- [ ] Scheduling implemented
- [ ] Templates created
- [ ] Mailgun integration
- [ ] Tests added

---

### Task 8: Implement WhatsApp Reminder Integration
ID: F1-008
Status: Open
Assignee: Unassigned

Context: Provide WhatsApp reminders using the WhatsApp Business API as an alternative delivery channel for reminders.

Goal: Compose and send WhatsApp messages for users who opt in, including rich content and quick actions.

Subtasks:
- Add opt-in checks and preference storage for WhatsApp.
- Implement message composer and API client for WhatsApp Business API.
- Handle delivery confirmations and errors.
- Add tests and sandbox integration.

Acceptance Criteria:
- Messages can be sent via WhatsApp API for opted-in users.
- Messages include rich content and actionable links.

Ways of Testing:
- Unit tests for message composition.
- Integration tests with WhatsApp sandbox.

Files likely to change:
- New service `lib/whatsapp-service.ts` or similar
- Preference storage updates in user profiles

Done checklist:
- [ ] Opt-in flow added
- [ ] WhatsApp client implemented
- [ ] Tests and sandbox integration

---

### Task 9: Add Analytics Tracking
ID: F1-009
Status: Open
Assignee: Unassigned

Context: Track bookmark actions and widget usage across SDKs for analytics (GA4 or similar).

Goal: Emit events for key actions (bookmark created, reminder scheduled, widget usage) to the analytics backend.

Subtasks:
- Define analytics event schema for bookmark flows.
- Instrument the web SDK and server endpoints to emit events.
- Add analytics to Android/iOS SDKs where feasible.
- Verify privacy/consent considerations are respected.

Acceptance Criteria:
- Events are logged for bookmark creation and reminders.
- Dashboard shows metrics for those events.

Ways of Testing:
- Unit tests for event payloads.
- Verify events appear in GA4 / analytics sandbox.

Files likely to change:
- SDK instrumentation code
- Server-side event emitters

Done checklist:
- [ ] Event schema defined
- [ ] Instrumentation added
- [ ] Tests and verification

---

### Task 10: Write API Documentation and Developer Guides
ID: F1-010
Status: Open
Assignee: Unassigned

Context: Provide developer-facing documentation for the SDKs, APIs, integration examples, and troubleshooting.

Goal: Produce clear guides, code samples, and FAQs so external developers can integrate the bookmark widget.

Subtasks:
- Draft API reference and usage guides for web/Android/iOS SDKs.
- Add sample integration pages and code snippets.
- Host docs or add them under `docs/` and add link from the repo README.
- Add quick troubleshooting and common error patterns.

Acceptance Criteria:
- Docs cover SDK initialization, auth, API endpoints, and examples.
- Code samples are correct and tested.

Ways of Testing:
- Follow docs to integrate sample widget and confirm behavior.
- Run link checks for docs.

Files likely to change:
- `docs/` additions
- `README.md` updates

Done checklist:
- [ ] API reference written
- [ ] Examples added
- [ ] Docs published/linked

---

Use this file to track progress by checking off completed subtasks and updating Status/Assignee metadata as work progresses.
