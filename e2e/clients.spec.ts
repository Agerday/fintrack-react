import { expect, test } from './fixtures';

test.describe('Clients', () => {
    test('lists the client of new invoices with their count and total', async ({
        page,
        client,
        createInvoice,
    }) => {
        await createInvoice(1200);
        await createInvoice(300.5);

        await page.goto('/clients');

        const row = page.getByRole('row', { name: new RegExp(client) });
        await expect(row).toContainText('2');
        await expect(row).toContainText('$1,500.50');
    });
});
