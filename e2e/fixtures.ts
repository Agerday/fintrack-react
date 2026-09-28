import { test as base, expect, type APIRequestContext, type Page } from '@playwright/test';
import type { Invoice } from '@/features/invoices/types';

export class InvoicesPage {
    constructor(readonly page: Page) {}

    // The HTML is server-rendered, but clicks and shortcuts only work after hydration.
    // The table is only rendered client-side after the fetch, so once visible, React runs
    async goto() {
        await this.page.goto('/invoices');
        await expect(this.page.getByRole('table')).toBeVisible();
    }

    row(text: string) {
        return this.page.getByRole('row', { name: new RegExp(text) });
    }

    async markAsPaid(text: string) {
        await this.row(text).getByRole('button', { name: 'Mark as paid' }).click();
    }

    async delete(text: string) {
        await this.row(text).getByRole('button', { name: 'Delete invoice' }).click();
        // exact: Playwright matches names as substrings, 'Delete' would also match the row buttons
        await this.page
            .getByRole('alertdialog')
            .getByRole('button', { name: 'Delete', exact: true })
            .click();
    }
}

type Fixtures = {
    // Unique per test; every invoice of this client is deleted after the test
    client: string;
    // Arranges an invoice for `client` through the API
    createInvoice: (amount?: number) => Promise<Invoice>;
    invoicesPage: InvoicesPage;
};

// E2E runs against the real server: without this cleanup, test invoices stay in its store
async function deleteInvoicesOf(request: APIRequestContext, client: string) {
    const invoices = (await (await request.get('/api/invoices')).json()) as Invoice[];
    for (const invoice of invoices.filter((i) => i.client === client)) {
        await request.delete(`/api/invoices/${invoice.id}`);
    }
}

export const test = base.extend<Fixtures>({
    client: async ({ request }, use, testInfo) => {
        const client = `E2E ${testInfo.workerIndex}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        await use(client);
        await deleteInvoicesOf(request, client);
    },

    createInvoice: async ({ request, client }, use) => {
        await use(async (amount = 100) => {
            const response = await request.post('/api/invoices', { data: { client, amount } });
            expect(response.status()).toBe(201);
            return (await response.json()) as Invoice;
        });
    },

    invoicesPage: async ({ page }, use) => {
        await use(new InvoicesPage(page));
    },
});

export { expect };
