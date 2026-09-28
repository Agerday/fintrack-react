import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { InvoiceTable } from './InvoiceTable';
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

        renderWithClient(<InvoiceTable />);

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
        renderWithClient(<InvoiceTable />);

        expect(await screen.findByText('No invoices yet')).toBeInTheDocument();
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
        const { user } = renderWithClient(<InvoiceTable />);

        await user.click(await screen.findByRole('button', { name: 'Try again' }));

        expect(await findRow(invoice.id)).toBeInTheDocument();
    });

    it('marks a pending invoice as paid', async () => {
        const invoice = buildInvoice({ status: 'pending' });
        invoiceDb.invoices = [invoice];
        const { user } = renderWithClient(<InvoiceTable />);

        await user.click(
            within(await findRow(invoice.id)).getByRole('button', { name: 'Mark as paid' }),
        );

        // The row re-renders after the refetch, so it is queried again inside waitFor
        await waitFor(async () => expect(await findRow(invoice.id)).toHaveTextContent('Paid'));
        expect(
            within(await findRow(invoice.id)).queryByRole('button', { name: 'Mark as paid' }),
        ).not.toBeInTheDocument();
    });

    it('keeps the invoice when the user cancels the deletion', async () => {
        const invoice = buildInvoice();
        invoiceDb.invoices = [invoice];
        const { user } = renderWithClient(<InvoiceTable />);

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
        const { user } = renderWithClient(<InvoiceTable />);

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

    it('shows an invoice created in another tab without reloading', async () => {
        const connected = new Promise<void>((resolve) => {
            server.use(invoiceEvents.addEventListener('connection', () => resolve()));
        });
        invoiceDb.invoices = [buildInvoice()];
        renderWithClient(<InvoiceTable />);
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
