// Runs before every test file (setupFiles in vitest.config.ts), like Karma's test.ts in Angular.

// Adds DOM matchers to expect(): toBeInTheDocument(), toHaveValue(), toBeDisabled()...
// The /vitest entry also registers their TypeScript types on Vitest's expect
import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { invoiceDb, server } from '@/test-utils/msw';

// Start intercepting the network once. 'error' makes any request without a handler fail
// the test: an unexpected call is a bug, it must not silently hit a real server
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// After each test: drop the per-test overrides (server.use) and restore the seed data,
// so every test starts from the same state
afterEach(() => {
    server.resetHandlers();
    invoiceDb.reset();
});

afterAll(() => server.close());
