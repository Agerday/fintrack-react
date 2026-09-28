// INTEGRATION TEST of the invoice list: QueryState + DataTable + InvoiceActions +
// ConfirmDialog + TanStack Query + the WebSocket hook, against the MSW fake backend.
import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { InvoiceTable } from './InvoiceTable';
import { invoiceDb, invoiceEvents, server } from '@/test-utils/msw';
import { renderWithClient } from '@/test-utils/render';

// jsdom doesn't load Tailwind: `hidden md:flex` does nothing, so BOTH the desktop table and
// the mobile cards are in the DOM. We scope every query to the <table> to avoid duplicates
async function findTable() {
    return screen.findByRole('table');
}

// A row is found by its accessible name, computed from its text content
async function findRow(invoiceId: string) {
    const table = await findTable();
    return within(table).getByRole('row', { name: new RegExp(invoiceId) });
}

describe('InvoiceTable', () => {
    it('shows a loading skeleton, then one row per invoice', async () => {
        renderWithClient(<InvoiceTable />);

        // First render: the query is pending, QueryState shows the skeleton
        expect(screen.getByLabelText('Loading')).toBeInTheDocument();

        const table = await findTable();
        // 1 header row + 1 row per invoice
        expect(within(table).getAllByRole('row')).toHaveLength(invoiceDb.invoices.length + 1);
        expect(within(table).getByRole('link', { name: 'INV-001' })).toHaveAttribute(
            'href',
            '/invoices/INV-001',
        );
    });

    it('shows an empty state when there is no invoice', async () => {
        server.use(http.get('/api/invoices', () => HttpResponse.json([])));

        renderWithClient(<InvoiceTable />);

        expect(await screen.findByText('No invoices yet')).toBeInTheDocument();
    });

    it('shows an error with a "Try again" button that refetches', async () => {
        // { once: true }: this handler answers the first request only, the next one falls
        // back to the default handler. Perfect to simulate "fails, then works"
        server.use(
            http.get('/api/invoices', () => HttpResponse.json({}, { status: 500 }), {
                once: true,
            }),
        );
        const { user } = renderWithClient(<InvoiceTable />);

        expect(await screen.findByText('Something went wrong')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Try again' }));

        expect(await findTable()).toBeInTheDocument();
    });

    it('marks an invoice as paid', async () => {
        const { user } = renderWithClient(<InvoiceTable />);
        const row = await findRow('INV-002');
        expect(within(row).getByText('Pending')).toBeInTheDocument();

        await user.click(within(row).getByRole('button', { name: 'Mark as paid' }));

        // PATCH -> onSuccess invalidates ['invoices'] -> refetch -> the row re-renders.
        // The row element may be replaced, so query it again inside waitFor
        await waitFor(async () => {
            expect(within(await findRow('INV-002')).getByText('Paid')).toBeInTheDocument();
        });
    });

    it('deletes an invoice only after confirmation', async () => {
        const { user } = renderWithClient(<InvoiceTable />);
        const row = await findRow('INV-002');

        await user.click(within(row).getByRole('button', { name: 'Delete invoice' }));

        // The dialog is rendered in a portal (outside the table), so we query `screen`
        const dialog = await screen.findByRole('alertdialog');
        expect(within(dialog).getByText('Delete invoice INV-002?')).toBeInTheDocument();

        // Cancel first: nothing must be deleted
        await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
        await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
        expect(invoiceDb.invoices.map((i) => i.id)).toContain('INV-002');

        // Then confirm
        await user.click(within(row).getByRole('button', { name: 'Delete invoice' }));
        await user.click(
            within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Delete' }),
        );

        await waitFor(() =>
            expect(
                within(screen.getByRole('table')).queryByText('INV-002'),
            ).not.toBeInTheDocument(),
        );
    });

    it('refreshes when the WebSocket server announces a change from another tab', async () => {
        // Resolves as soon as the hook's socket connects to the MSW WebSocket link.
        // (Counting invoiceEvents.clients would be flaky: sockets of previous tests may
        // still be listed while they finish closing)
        const connected = new Promise<void>((resolve) => {
            server.use(invoiceEvents.addEventListener('connection', () => resolve()));
        });
        renderWithClient(<InvoiceTable />);
        await findTable();
        await connected;

        // Another tab created an invoice: the "database" changes, then the server pushes
        invoiceDb.invoices = [
            ...invoiceDb.invoices,
            { id: 'INV-777', client: 'Stark', date: '2026-09-28', amount: 1, status: 'pending' },
        ];
        invoiceEvents.broadcast(
            JSON.stringify({ type: 'invoice.created', id: 'INV-777', sourceId: 'other-tab' }),
        );

        // No reload, no user action: the new row appears on its own
        expect(await within(await findTable()).findByText('INV-777')).toBeInTheDocument();
    });
});
