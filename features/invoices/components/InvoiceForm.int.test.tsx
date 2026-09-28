import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { InvoiceForm } from './InvoiceForm';
import { server } from '@/test/msw/server';
import { invoiceDb } from '@/test/msw/handlers/invoices';
import { renderWithClient } from '@/test/render';

async function fillAndSubmit(user: ReturnType<typeof renderWithClient>['user']) {
    await user.type(screen.getByLabelText('Client'), 'Wayne Enterprises');
    await user.type(screen.getByLabelText('Amount'), '1250.5');
    await user.click(screen.getByRole('button', { name: 'Create invoice' }));
}

describe('InvoiceForm', () => {
    it('shows the required errors and sends nothing when submitted empty', async () => {
        const onRequest = vi.fn();
        server.events.on('request:start', onRequest);
        const { user } = renderWithClient(<InvoiceForm />);

        await user.click(screen.getByRole('button', { name: 'Create invoice' }));

        expect(await screen.findByText('Client is required')).toBeInTheDocument();
        expect(screen.getByText('Amount is required')).toBeInTheDocument();
        expect(onRequest).not.toHaveBeenCalled();
    });

    it('creates the invoice with the typed values, then calls onSuccess', async () => {
        const onSuccess = vi.fn();
        const { user } = renderWithClient(<InvoiceForm onSuccess={onSuccess} />);

        await fillAndSubmit(user);

        await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
        expect(invoiceDb.invoices).toEqual([
            expect.objectContaining({ client: 'Wayne Enterprises', amount: 1250.5 }),
        ]);
    });

    it('shows a server validation error under the matching field', async () => {
        server.use(
            http.post('/api/invoices', () =>
                HttpResponse.json(
                    { message: 'This client is blocked', field: 'client' },
                    { status: 400 },
                ),
            ),
        );
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const onSuccess = vi.fn();
        const { user } = renderWithClient(<InvoiceForm onSuccess={onSuccess} />);

        await fillAndSubmit(user);

        expect(await screen.findByText('This client is blocked')).toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it('shows a generic error under the form when the server fails', async () => {
        server.use(
            http.post('/api/invoices', () =>
                HttpResponse.json({ message: 'Internal server error' }, { status: 500 }),
            ),
        );
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const { user } = renderWithClient(<InvoiceForm />);

        await fillAndSubmit(user);

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Something went wrong on our end.',
        );
    });
});
