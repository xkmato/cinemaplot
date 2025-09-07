# Development & Local Run

This document covers how to run and develop the application locally.

Available scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

Run development server

```bash
npm run dev
# or
# yarn dev
# or
# pnpm dev
```

Open http://localhost:3000

Project layout

- `app/` - Next.js App Router (pages & routes)
- `components/` - Reusable React components
- `lib/` - Utilities, Firebase setup, helpers
- `public/` - Static assets
- `styles/` - Global styles

Tips

- Keep `.env.local` out of commits. Use `.env.example` as a template.
- Use the Firebase emulators for safe local testing of authentication and Firestore.
- Run `npm run lint` and `npm run type-check` before opening PRs.

Quick contract of key modules

- `lib/firebase.ts` — initializes Firebase client
- `lib/firebase-admin.ts` — server/admin utilities (if used in functions)
- `lib/auth-context.tsx` — React Context for auth state

Edge cases to consider while developing

- Missing or invalid environment variables
- Unavailable Firebase services during local dev
- Timezone differences for event dates
- Mobile/responsive breakpoints

Small improvements included in repo

- Pre-configured ESLint and TypeScript
- Jest and Playwright configs for tests

What's next

- See `docs/TESTING.md` for tests and `docs/DEPLOYMENT.md` for deployment instructions.
