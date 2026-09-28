import { expect, InvoicesPage, test } from './fixtures';

test.describe('Real-time updates', () => {
    test('another user sees an invoice created, paid then deleted without reloading', async ({
        browser,
        client,
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

        await createInvoice();
        await expect(bob.row(client)).toBeVisible();

        await alice.goto();
        await alice.markAsPaid(client);
        await expect(bob.row(client)).toContainText('Paid');

        await alice.delete(client);
        await expect(bob.row(client)).toBeHidden();

        await aliceContext.close();
        await bobContext.close();
    });
});
