import { defineConfig, devices } from '@playwright/test';

// E2E = End-to-End: a real browser drives the real app (Next dev server + real API +
// real WebSocket server). Nothing is mocked. Slowest tests, but the closest to a user.
// Angular analogy: Protractor / Cypress. See https://playwright.dev/docs/test-configuration
export default defineConfig({
    testDir: './e2e',
    // Tests run in parallel workers, so they must not depend on each other: each test
    // creates its own invoice (unique name) instead of relying on the seed data
    fullyParallel: true,
    // Fail the CI build if a test.only was committed by mistake
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    // 'list' prints progress in the terminal, 'html' builds a report: npx playwright show-report
    reporter: [['list'], ['html', { open: 'never' }]],
    // Assertions retry for 5s by default. The Next DEV server compiles and renders pages on
    // demand, and with several parallel browsers a client-side navigation can take longer
    // (the URL only changes once the new page has arrived). Against a production build
    // (npm run build && npm run start) the default would be plenty
    expect: { timeout: 15_000 },
    use: {
        // page.goto('/invoices') -> http://localhost:3000/invoices
        baseURL: 'http://localhost:3000',
        // On failure, keep a trace: a timeline with DOM snapshots, network and console.
        // Open it with: npx playwright show-trace <file> (or from the HTML report)
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },

    // Chromium only: fast and enough for a training project. Firefox / WebKit projects can
    // be added back here to test cross-browser
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

    // Playwright starts the servers before the tests and stops them after.
    // reuseExistingServer: if `npm run dev` / `npm run ws` already run, reuse them
    webServer: [
        {
            command: 'npm run dev',
            url: 'http://localhost:3000',
            reuseExistingServer: !process.env.CI,
            timeout: 120_000,
        },
        {
            // The socket server answers 404 on GET /, so wait for the port instead of a URL
            command: 'npm run ws',
            port: 3001,
            reuseExistingServer: !process.env.CI,
        },
    ],
});
