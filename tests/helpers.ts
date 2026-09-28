import { expect, type APIRequestContext, type Page } from '@playwright/test';
import type { Invoice } from '@/features/invoices/types';

// Seeds data through the API instead of the UI: faster, and the test stays focused on what
// it really checks. `request` is Playwright's HTTP client (no browser involved)
export async function createInvoiceViaApi(
    request: APIRequestContext,
    client: string,
    amount = 100,
): Promise<Invoice> {
    const response = await request.post('/api/invoices', { data: { client, amount } });
    expect(response.status()).toBe(201);
    // POST returns the whole list: pick the invoice we just created
    const invoices = (await response.json()) as Invoice[];
    const invoice = invoices.find((i) => i.client === client);
    if (!invoice) throw new Error(`Invoice for ${client} not found after creation`);
    return invoice;
}

// Opens the invoice list and waits until React is interactive.
// Why wait for the table? The server renders the page HTML (the button is visible at once),
// but clicks and shortcuts only work after hydration. The table is only rendered in the
// browser after the client-side fetch, so once it's visible, React is running
export async function gotoInvoices(page: Page) {
    await page.goto('/invoices');
    await expect(page.getByRole('table')).toBeVisible();
}

// Rows are found by their accessible name (their text), exactly like a user scanning the list
export function invoiceRow(page: Page, text: string) {
    return page.getByRole('row', { name: new RegExp(text) });
}
