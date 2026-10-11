import { expect, InvoicesPage, test } from './fixtures';

test.describe('Real-time updates', () => {
    test('another user sees invoices created, paid and deleted without reloading', async ({
        browser,
        createInvoice,
    }) => {
        // Two contexts = two isolated users, each with its own socket connection
        const aliceContext = await browser.newContext();
        const bobContext = await browser.newContext();
        const alice = new InvoicesPage(await aliceContext.newPage());
        const bob = new InvoicesPage(await bobContext.newPage());
        // Known race: an event sent before Bob's socket is open is lost (the server keeps no
        // history), and the page exposes no "socket open" signal to wait for. Seen only under
        // heavy local load (--repeat-each); CI runs one worker and retries twice
        await bob.goto();

        const paid = await createInvoice();
        await expect(bob.row(paid.id)).toBeVisible();

        await alice.goto();
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
