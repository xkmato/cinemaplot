
# TASKS

This file lists all project tasks. Add new tasks as numbered items below. Each task should include Status and Assignee metadata.

---

### Task 1 — Make header links available on mobile (mobile menu)

ID: 001
Status: Open
Assignee: Unassigned

Context: the header navigation lives in the app UI under `#app` (see `components/shared-header.tsx`). On small screens the header links are not currently available — we need a responsive menu.

Goal: implement a mobile-friendly menu so the header links are reachable on phones and small viewports.

Subtasks:
- Inspect `components/shared-header.tsx` and any related header/layout files under `app/` and `components/` to determine current behavior on small screens.
- Add a responsive mobile menu (hamburger toggle) that shows the same links as the desktop header. Prefer a small, accessible component (aria attributes, keyboard focus, screen-reader text).
- Ensure styling is responsive and matches existing design tokens (use `globals.css` / existing tailwind/postcss setup if present).
- Add unit/interaction tests (playwright or jest with testing-library) to cover open/close behavior and link visibility on small screens.
- Update docs (brief note in `docs/` or this `TASKS.md`) describing the change and any new props for the header component.

Acceptance criteria:
- On viewports <= 768px the header shows a menu button which opens a menu listing the same navigation links as desktop.
- Menu is keyboard accessible (opens with Enter/Space, focus trapped while open or returns focus on close, Esc closes it).
- Links navigate to the same routes as desktop header.
- Visual styles integrate with existing CSS and do not break desktop layout.
- Tests added that verify open/close and link presence.

Files likely to change:
- `components/shared-header.tsx` (primary)
- `components/ui/` (if extracting a small Menu component)
- `app/layout.tsx` or other layout files if header wiring needs changes
- `globals.css` / postcss/tailwind config for any responsive styles
- `__tests__/*` or `playwright-tests/*` for tests

Notes / assumptions:
- Assume `components/shared-header.tsx` is the canonical header used across `#app` pages. If there are multiple headers, update each consumer or lift the menu into a shared component.
- Prefer minimal dependencies; use existing UI primitives already in the repo.

Estimated effort: 3-6 hours (dev + tests).

Done checklist (mark when complete):
- [ ] Inspect header and confirm where links are defined
- [ ] Implement mobile menu component and styles
- [ ] Add accessibility behavior (aria, keyboard)
- [ ] Add tests (unit/integration)
- [ ] Update docs and QA on devices

