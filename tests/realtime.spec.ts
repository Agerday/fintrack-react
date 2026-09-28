// E2E test of the real-time updates: TWO browser contexts (= two separate users, each with
// its own cookies and tabs). A change made by one must appear in the other, without reload.
// This goes through everything: Route Handler -> publishEvent -> socket server -> WebSocket
// -> useInvoiceEvents -> TanStack Query refetch -> re-render.
//
// Requires the socket server (`npm run ws`): playwright.config.ts starts it with the app.
import { expect, test } from './fixtures';
import { createInvoiceViaApi, gotoInvoices, invoiceRow } from './helpers';

test.describe('Real-time updates', () => {
    test('another user sees a new, updated then deleted invoice live', async ({
        browser,
        client,
        request,
    }) => {
        // browser.newContext() = a fresh, isolated browser profile (like an incognito window)
        const aliceContext = await browser.newContext();
        const bobContext = await browser.newContext();
        const alice = await aliceContext.newPage();
        const bob = await bobContext.newPage();

        // Bob just watches the list. Once the table is there, his socket is connecting too.
        // Known small race: an event pushed before his socket is open would be missed; the
        // steps below take far longer than a localhost handshake, so it never happens here
        await gotoInvoices(bob);

        // 1. Created by someone else (here: straight through the API)
        await createInvoiceViaApi(request, client);
        const bobRow = invoiceRow(bob, client);
        await expect(bobRow).toBeVisible();

        // 2. Updated by Alice in her own browser
        await gotoInvoices(alice);
        await invoiceRow(alice, client).getByRole('button', { name: 'Mark as paid' }).click();
        await expect(bobRow).toContainText('Paid');

        // 3. Deleted by Alice
        await invoiceRow(alice, client).getByRole('button', { name: 'Delete invoice' }).click();
        await alice
            .getByRole('alertdialog')
            .getByRole('button', { name: 'Delete', exact: true })
            .click();
        await expect(bobRow).toBeHidden();

        // Contexts created by hand are not closed automatically (the `page` fixture is)
        await aliceContext.close();
        await bobContext.close();
    });
});
