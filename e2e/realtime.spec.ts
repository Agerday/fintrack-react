import { expect, InvoicesPage, test } from './fixtures';

test.describe('Real-time updates', () => {
    test('another user sees invoices created, paid and deleted without reloading', async ({
        browser,
        client,
        createInvoice,
    }) => {
        // Two contexts = two isolated users, each with its own socket connection
        const aliceContext = await browser.newContext();
        const bobContext = await browser.newContext();
        const alice = new InvoicesPage(await aliceContext.newPage());
        const bob = new InvoicesPage(await bobContext.newPage());
        // goto() waits for "Live": Bob's socket is open before the first event is sent
        await bob.goto(client);

        const paid = await createInvoice();
        await expect(bob.row(paid.id)).toBeVisible();

        await alice.goto(client);
        await alice.markAsPaid(paid.id);
        await expect(bob.row(paid.id)).toContainText('Paid');

        // A paid invoice can't be deleted, so the deletion is shown on a second, unpaid one
        const unpaid = await createInvoice();
        await expect(bob.row(unpaid.id)).toBeVisible();
        await alice.delete(unpaid.id);
        await expect(bob.row(unpaid.id)).toBeHidden();

        await aliceContext.close();
        await bobContext.close();
    });
});
