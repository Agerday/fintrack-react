// E2E tests of the invoice flows. Playwright basics used here:
// - page.getByRole / getByLabel / getByText: same "user-facing" queries as Testing Library
// - locators are lazy and retried: `expect(locator).toBeVisible()` waits (5s by default)
//   until it passes, so there is no sleep() anywhere. Angular analogy: no more
//   browser.sleep() / waitForAngular() like in Protractor
import { expect, test } from './fixtures';
import { createInvoiceViaApi, gotoInvoices, invoiceRow } from './helpers';

test.describe('Invoices', () => {
    test('creates an invoice from the dialog opened with the N shortcut', async ({
        page,
        client,
    }) => {
        await gotoInvoices(page);

        await page.keyboard.press('n');
        const dialog = page.getByRole('dialog', { name: 'Create invoice' });
        await expect(dialog).toBeVisible();

        await dialog.getByLabel('Client').fill(client);
        // Typing "n" inside the field must type it, not reopen the dialog (hotkey bug fixed earlier)
        await expect(dialog.getByLabel('Client')).toHaveValue(client);

        await dialog.getByLabel('Amount').fill('1250.5');
        // Real browser check of the blur formatting (jsdom couldn't test it with user-event)
        await dialog.getByLabel('Amount').blur();
        await expect(dialog.getByLabel('Amount')).toHaveValue('1250.50');

        await dialog.getByRole('button', { name: 'Create invoice' }).click();

        await expect(dialog).toBeHidden();
        const row = invoiceRow(page, client);
        await expect(row).toBeVisible();
        await expect(row).toContainText('$1,250.50');
        await expect(row).toContainText('Pending');
    });

    test('shows the validation errors when the form is submitted empty', async ({ page }) => {
        await gotoInvoices(page);

        await page.getByRole('button', { name: /New invoice/ }).click();
        await page.getByRole('button', { name: 'Create invoice' }).click();

        await expect(page.getByText('Client is required')).toBeVisible();
        await expect(page.getByText('Amount is required')).toBeVisible();
    });

    test('marks an invoice as paid from the list', async ({ page, client, request }) => {
        // Arrange through the API, act and assert through the UI
        await createInvoiceViaApi(request, client);
        await gotoInvoices(page);
        const row = invoiceRow(page, client);

        await row.getByRole('button', { name: 'Mark as paid' }).click();

        await expect(row).toContainText('Paid');
        // Already paid: the action is gone
        await expect(row.getByRole('button', { name: 'Mark as paid' })).toBeHidden();
    });

    test('opens the detail page of an invoice', async ({ page, client, request }) => {
        const invoice = await createInvoiceViaApi(request, client, 42);
        await gotoInvoices(page);

        await invoiceRow(page, client).getByRole('link', { name: invoice.id }).click();

        await expect(page).toHaveURL(`/invoices/${invoice.id}`);
        await expect(page.getByRole('heading', { name: `Invoice ${invoice.id}` })).toBeVisible();
        await expect(page.getByText(client)).toBeVisible();
        await expect(page.getByText('$42.00')).toBeVisible();
    });

    test('deletes an invoice after confirmation', async ({ page, client, request }) => {
        await createInvoiceViaApi(request, client);
        await gotoInvoices(page);
        const row = invoiceRow(page, client);

        await row.getByRole('button', { name: 'Delete invoice' }).click();
        const confirm = page.getByRole('alertdialog');
        await expect(confirm).toBeVisible();
        // Playwright's name matching is a case-insensitive SUBSTRING by default:
        // exact: true avoids also matching the "Delete invoice" buttons of the rows
        await confirm.getByRole('button', { name: 'Delete', exact: true }).click();

        await expect(row).toBeHidden();
    });

    test('shows a not found state for an unknown invoice', async ({ page }) => {
        await page.goto('/invoices/INV-DOES-NOT-EXIST');

        await expect(page.getByText('The requested resource was not found.')).toBeVisible();
    });
});

// test.use() changes the options for this describe block only: here a phone-sized viewport
test.describe('Mobile layout', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('navigates with the drawer menu', async ({ page }) => {
        await page.goto('/');
        // Recent invoices only render after the client-side fetch: React is hydrated
        await expect(page.getByText('Recent invoices')).toBeVisible();
        // The desktop sidebar is hidden on mobile
        await expect(page.getByRole('link', { name: 'Clients' })).toBeHidden();

        await page.getByRole('button', { name: 'Open navigation' }).click();
        await page.getByRole('link', { name: 'Clients' }).click();

        await expect(page).toHaveURL('/clients');
        await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible();
        // The drawer closes itself after navigating
        await expect(page.getByRole('dialog')).toBeHidden();
    });

    test('shows invoices as cards instead of a table', async ({ page, client, request }) => {
        await createInvoiceViaApi(request, client);

        await page.goto('/invoices');

        // Same data, other layout: the <table> exists in the DOM but is display:none.
        // Unlike getByRole, getByText also matches hidden elements, so it finds the name
        // twice (hidden table cell + visible card) and fails in strict mode.
        // filter({ visible: true }) keeps only what the user can actually see
        await expect(page.getByText(client).filter({ visible: true })).toBeVisible();
        await expect(page.getByRole('table')).toBeHidden();
    });
});
