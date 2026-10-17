import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { InvoiceTable } from './InvoiceTable';
import { defaultInvoiceListParams } from '../schema';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { server } from '@/test/msw/server';
import { invoiceDb, invoiceEvents } from '@/test/msw/handlers/invoices';
import { buildInvoice } from '@/test/factories';
import { renderWithClient } from '@/test/render';

// jsdom loads no CSS, so the desktop table AND the mobile cards are both in the DOM:
// queries are scoped to the <table> to avoid matching every invoice twice
async function findRow(text: string) {
    return within(await screen.findByRole('table')).findByRole('row', {
        name: new RegExp(text),
    });
}

describe('InvoiceTable', () => {
    it('lists the invoices with a link to their detail page', async () => {
        const invoice = buildInvoice({ client: 'Acme', amount: 2400 });
        invoiceDb.invoices = [invoice, buildInvoice()];

        renderWithClient(<InvoiceTable params={defaultInvoiceListParams} />);

        const row = await findRow(invoice.id);
        expect(row).toHaveTextContent('Acme');
        expect(row).toHaveTextContent('$2,400.00');
        expect(within(row).getByRole('link', { name: invoice.id })).toHaveAttribute(
            'href',
            `/invoices/${invoice.id}`,
        );
        expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(3);
    });

    it('shows an empty state when there is no invoice', async () => {
        renderWithClient(<InvoiceTable params={defaultInvoiceListParams} />);

        expect(await screen.findByText('No invoices yet')).toBeInTheDocument();
    });

    it('shows only the invoices matching the search and the status of the URL', async () => {
        const match = buildInvoice({ client: 'Acme', status: 'pending' });
        invoiceDb.invoices = [
            match,
            buildInvoice({ client: 'Acme', status: 'paid' }),
            buildInvoice({ client: 'Globex', status: 'pending' }),
        ];

        renderWithClient(
            <InvoiceTable params={{ ...defaultInvoiceListParams, q: 'acme', status: 'pending' }} />,
        );

        await findRow(match.id);
        expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(2);
        expect(screen.getByRole('searchbox', { name: 'Search invoices' })).toHaveValue('acme');
    });

    it('says when no invoice matches the search, not that there are none', async () => {
        invoiceDb.invoices = [buildInvoice({ client: 'Acme' })];

        renderWithClient(<InvoiceTable params={{ ...defaultInvoiceListParams, q: 'globex' }} />);

        expect(await screen.findByText('No invoices match your search')).toBeInTheDocument();
    });

    it('links each status filter to its URL, keeping the search', async () => {
        renderWithClient(<InvoiceTable params={{ ...defaultInvoiceListParams, q: 'acme' }} />);

        const filters = await screen.findByRole('navigation', { name: 'Filter by status' });
        expect(within(filters).getByRole('link', { name: 'Paid' })).toHaveAttribute(
            'href',
            '/invoices?q=acme&status=paid',
        );
        expect(within(filters).getByRole('link', { name: 'All' })).toHaveAttribute(
            'aria-current',
            'page',
        );
    });

    it('shows 10 invoices per page with a link to the next one', async () => {
        invoiceDb.invoices = Array.from({ length: 12 }, () => buildInvoice());

        renderWithClient(<InvoiceTable params={defaultInvoiceListParams} />);

        const pagination = await screen.findByRole('navigation', { name: 'Pagination' });
        expect(pagination).toHaveTextContent('Page 1 of 2');
        expect(within(pagination).getByRole('link', { name: 'Next' })).toHaveAttribute(
            'href',
            '/invoices?page=2',
        );
        expect(
            within(pagination).queryByRole('link', { name: 'Previous' }),
        ).not.toBeInTheDocument();
        expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(11);
    });

    it('links the sorted column to the reverse order and the others to their own sort', async () => {
        invoiceDb.invoices = [buildInvoice()];

        renderWithClient(<InvoiceTable params={{ ...defaultInvoiceListParams, page: 2 }} />);

        const table = await screen.findByRole('table');
        expect(within(table).getByRole('columnheader', { name: 'Date' })).toHaveAttribute(
            'aria-sort',
            'descending',
        );
        expect(within(table).getByRole('link', { name: 'Date' })).toHaveAttribute(
            'href',
            '/invoices?dir=asc',
        );
        expect(within(table).getByRole('link', { name: 'Client' })).toHaveAttribute(
            'href',
            '/invoices?sort=client&dir=asc',
        );
    });

    it('shows the invoices after a failed load once the user clicks "Try again"', async () => {
        const invoice = buildInvoice();
        invoiceDb.invoices = [invoice];
        server.use(
            http.get(
                '/api/invoices',
                () => HttpResponse.json({ message: 'Internal server error' }, { status: 500 }),
                { once: true },
            ),
        );
        const { user } = renderWithClient(<InvoiceTable params={defaultInvoiceListParams} />);

        await user.click(await screen.findByRole('button', { name: 'Try again' }));

        expect(await findRow(invoice.id)).toBeInTheDocument();
    });

    it('marks a pending invoice as paid', async () => {
        const invoice = buildInvoice({ status: 'pending' });
        invoiceDb.invoices = [invoice];
        const { user } = renderWithClient(<InvoiceTable params={defaultInvoiceListParams} />);

        await user.click(
            within(await findRow(invoice.id)).getByRole('button', { name: 'Mark as paid' }),
        );

        // The row re-renders after the refetch, so it is queried again inside waitFor
        await waitFor(async () => expect(await findRow(invoice.id)).toHaveTextContent('Paid'));
        expect(
            within(await findRow(invoice.id)).queryByRole('button', { name: 'Mark as paid' }),
        ).not.toBeInTheDocument();
    });

    it('shows the invoice as paid at once, before the API answers', async () => {
        const invoice = buildInvoice({ status: 'pending' });
        invoiceDb.invoices = [invoice];
        let answer = () => {};
        // Holds the request until answer(), then lets the regular handler reply
        server.use(
            http.patch(
                '/api/invoices/:id',
                () => new Promise<undefined>((resolve) => (answer = () => resolve(undefined))),
            ),
        );
        const { user } = renderWithClient(<InvoiceTable params={defaultInvoiceListParams} />);

        await user.click(
            within(await findRow(invoice.id)).getByRole('button', { name: 'Mark as paid' }),
        );

        expect(await findRow(invoice.id)).toHaveTextContent('Paid');
        // Settle the request: React keeps every optimistic value until all pending actions end,
        // a request left hanging would freeze the next tests' rollbacks
        answer();
        await waitFor(() => expect(invoiceDb.invoices[0].status).toBe('paid'));
    });

    it('puts the invoice back to pending when the API refuses the payment', async () => {
        const invoice = buildInvoice({ status: 'pending' });
        invoiceDb.invoices = [invoice];
        server.use(
            http.patch('/api/invoices/:id', () =>
                HttpResponse.json({ message: 'Server unavailable' }, { status: 503 }),
            ),
        );
        const { user } = renderWithClient(<InvoiceTable params={defaultInvoiceListParams} />);

        await user.click(
            within(await findRow(invoice.id)).getByRole('button', { name: 'Mark as paid' }),
        );

        await waitFor(async () =>
            expect(
                within(await findRow(invoice.id)).getByRole('button', { name: 'Mark as paid' }),
            ).toBeInTheDocument(),
        );
        expect(await findRow(invoice.id)).toHaveTextContent('Pending');
    });

    it('tells the user why an invoice could not be marked as paid', async () => {
        const invoice = buildInvoice({ status: 'pending' });
        invoiceDb.invoices = [invoice];
        server.use(
            http.patch('/api/invoices/:id', () =>
                HttpResponse.json(
                    { message: 'A paid invoice cannot change status' },
                    { status: 409 },
                ),
            ),
        );
        const { user } = renderWithClient(
            <>
                <NotificationBell />
                <InvoiceTable params={defaultInvoiceListParams} />
            </>,
        );

        await user.click(
            within(await findRow(invoice.id)).getByRole('button', { name: 'Mark as paid' }),
        );
        await user.click(await screen.findByRole('button', { name: 'Notifications (1 unread)' }));

        const panel = await screen.findByRole('dialog');
        expect(within(panel).getByText(`Could not mark ${invoice.id} as paid`)).toBeInTheDocument();
        expect(within(panel).getByText('A paid invoice cannot change status')).toBeInTheDocument();
    });

    it('keeps the invoice when the user cancels the deletion', async () => {
        const invoice = buildInvoice();
        invoiceDb.invoices = [invoice];
        const { user } = renderWithClient(<InvoiceTable params={defaultInvoiceListParams} />);

        await user.click(
            within(await findRow(invoice.id)).getByRole('button', { name: 'Delete invoice' }),
        );
        await user.click(
            within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Cancel' }),
        );

        await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
        expect(await findRow(invoice.id)).toBeInTheDocument();
    });

    it('deletes the invoice when the user confirms', async () => {
        const invoice = buildInvoice();
        invoiceDb.invoices = [invoice, buildInvoice()];
        const { user } = renderWithClient(<InvoiceTable params={defaultInvoiceListParams} />);

        await user.click(
            within(await findRow(invoice.id)).getByRole('button', { name: 'Delete invoice' }),
        );
        const dialog = await screen.findByRole('alertdialog');
        expect(dialog).toHaveTextContent(`Delete invoice ${invoice.id}?`);
        await user.click(within(dialog).getByRole('button', { name: 'Delete' }));

        await waitFor(() =>
            expect(
                within(screen.getByRole('table')).queryByRole('link', { name: invoice.id }),
            ).not.toBeInTheDocument(),
        );
    });

    it('offers no delete action on a paid invoice, as its money is on the account', async () => {
        const invoice = buildInvoice({ status: 'paid' });
        invoiceDb.invoices = [invoice];

        renderWithClient(<InvoiceTable params={defaultInvoiceListParams} />);

        expect(
            within(await findRow(invoice.id)).queryByRole('button', { name: 'Delete invoice' }),
        ).not.toBeInTheDocument();
    });

    it('shows an invoice created in another tab without reloading', async () => {
        const connected = new Promise<void>((resolve) => {
            server.use(invoiceEvents.addEventListener('connection', () => resolve()));
        });
        invoiceDb.invoices = [buildInvoice()];
        renderWithClient(<InvoiceTable params={defaultInvoiceListParams} />);
        await screen.findByRole('table');
        await connected;
        const created = buildInvoice({ client: 'Stark Industries' });

        invoiceDb.invoices = [...invoiceDb.invoices, created];
        invoiceEvents.broadcast(
            JSON.stringify({ type: 'invoice.created', id: created.id, sourceId: 'other-tab' }),
        );

        expect(await findRow(created.id)).toHaveTextContent('Stark Industries');
    });
});
