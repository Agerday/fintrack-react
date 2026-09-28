// E2E tests are NOT mocked: they run against the real dev server, so every invoice they create
// really lands in its in-memory store. Without cleanup, each run leaves test data behind in
// the app you are using. This fixture guarantees the cleanup.
//
// A Playwright fixture is set up before the test and torn down after it, even when the test
// fails. The test declares what it needs in its parameters ({ page, client }) and Playwright
// provides it, like dependency injection. Angular analogy: a TestBed provider + an afterEach
import { test as base, type APIRequestContext } from '@playwright/test';
import type { Invoice } from '@/features/invoices/types';

type Fixtures = {
    // Unique client name for this test. Every invoice created with it (through the UI or
    // the API) is deleted once the test is over
    client: string;
};

async function deleteInvoicesOf(request: APIRequestContext, client: string) {
    const response = await request.get('/api/invoices');
    const invoices = (await response.json()) as Invoice[];
    for (const invoice of invoices.filter((i) => i.client === client)) {
        await request.delete(`/api/invoices/${invoice.id}`);
    }
}

// base.extend = the default `test` + our fixtures. Specs import `test` from here instead of
// '@playwright/test' to get them
export const test = base.extend<Fixtures>({
    client: async ({ request }, use, testInfo) => {
        // Unique across parallel workers and runs: a test only ever looks at its own data
        const client = `E2E ${testInfo.workerIndex}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Everything before use() is the setup, use() runs the test, everything after is
        // the teardown (the equivalent of afterEach, but scoped to the tests using `client`)
        await use(client);

        await deleteInvoicesOf(request, client);
    },
});

export { expect } from '@playwright/test';
