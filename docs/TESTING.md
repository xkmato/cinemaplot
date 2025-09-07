# Testing

This project uses Jest for unit/integration tests and Playwright for end-to-end tests.

Jest

- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report

Playwright

- `npm run test:e2e` - Run E2E tests headless
- `npm run test:e2e:ui` - Run Playwright in headed interactive mode

Notes

- Tests and test utilities live under `__tests__/`
- Use the provided `jest.setup.ts` and `jest.setup.js` for mocks and DOM setup
- Playwright configuration is at `playwright.config.ts`

Quick checklist for test runs

- Ensure environment variables required by tests are set
- Prefer Firebase emulators for tests that touch Firestore/Auth
- Run `npm run test:coverage` to verify thresholds before merging
