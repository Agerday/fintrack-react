import { expect, test } from './fixtures';

test.describe('Invoices', () => {
    test('creates an invoice from the dialog opened with the N shortcut', async ({
        page,
        client,
        invoicesPage,
    }) => {
        await invoicesPage.goto();

        await page.keyboard.press('n');
        const dialog = page.getByRole('dialog', { name: 'Create invoice' });
        await dialog.getByLabel('Client').fill(client);
        await dialog.getByLabel('Amount').fill('1250.5');
        // Checked here: user-event rewrites number inputs on blur in jsdom
        await dialog.getByLabel('Amount').blur();
        await expect(dialog.getByLabel('Amount')).toHaveValue('1250.50');
        await dialog.getByRole('button', { name: 'Create invoice' }).click();

        await expect(dialog).toBeHidden();
        await expect(invoicesPage.row(client)).toContainText('$1,250.50');
        await expect(invoicesPage.row(client)).toContainText('Pending');
    });

    test('sends the invoices already rendered in the HTML, before any JavaScript runs', async ({
        page,
        client,
        createInvoice,
    }) => {
        const invoice = await createInvoice();

        // The raw server response: no browser, so no client-side fetch could fill the table
        const list = await (await page.request.get('/invoices')).text();
        const detail = await (await page.request.get(`/invoices/${invoice.id}`)).text();

        expect(list).toContain(client);
        expect(detail).toContain(client);
    });

    test('marks an invoice as paid', async ({ client, createInvoice, invoicesPage }) => {
        await createInvoice();
        await invoicesPage.goto();

        await invoicesPage.markAsPaid(client);

        await expect(invoicesPage.row(client)).toContainText('Paid');
    });

    test('credits the bank account when an invoice is paid', async ({
        page,
        client,
        createInvoice,
        invoicesPage,
    }) => {
        await createInvoice(137);
        await invoicesPage.goto();

        await invoicesPage.markAsPaid(client);
        await expect(invoicesPage.row(client)).toContainText('Paid');
        await page.getByRole('link', { name: 'Bank account' }).click();

        // Matched by the unique client name: other tests pay invoices in parallel
        await expect(page.getByRole('listitem').filter({ hasText: client })).toContainText(
            '+$137.00',
        );
    });

    test('opens the detail page of an invoice', async ({
        page,
        client,
        createInvoice,
        invoicesPage,
    }) => {
        const invoice = await createInvoice(42);
        await invoicesPage.goto();

        await invoicesPage.row(client).getByRole('link', { name: invoice.id }).click();

        await expect(page).toHaveURL(`/invoices/${invoice.id}`);
        await expect(page.getByRole('heading', { name: `Invoice ${invoice.id}` })).toBeVisible();
        await expect(page.getByText(client)).toBeVisible();
        await expect(page.getByText('$42.00')).toBeVisible();
    });

    test('deletes an invoice after confirmation', async ({
        client,
        createInvoice,
        invoicesPage,
    }) => {
        await createInvoice();
        await invoicesPage.goto();

        await invoicesPage.delete(client);

        await expect(invoicesPage.row(client)).toBeHidden();
    });

    test('shows a not found state for an unknown invoice', async ({ page }) => {
        await page.goto('/invoices/INV-DOES-NOT-EXIST');

        await expect(page.getByText('The requested resource was not found.')).toBeVisible();
    });
});

test.describe('Mobile', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('navigates with the drawer menu', async ({ page }) => {
        await page.goto('/');
        // The dashboard is server-rendered: "Live" (the top movers socket) means React runs
        await expect(page.getByRole('status').filter({ hasText: 'Live' })).toBeVisible();

        await page.getByRole('button', { name: 'Open navigation' }).click();
        await page.getByRole('link', { name: 'Clients' }).click();

        await expect(page).toHaveURL('/clients');
        await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible();
        await expect(page.getByRole('dialog')).toBeHidden();
    });
});
