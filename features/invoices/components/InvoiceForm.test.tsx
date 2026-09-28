// INTEGRATION TEST: the real form, the real React Hook Form + Zod validation, the real
// TanStack Query mutation and the real apiClient. Only the network is fake (MSW).
// If any of these layers breaks, the test breaks: that's the point of an integration test.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { InvoiceForm } from './InvoiceForm';
import { server } from '@/test-utils/msw';
import { renderWithClient } from '@/test-utils/render';
import { TAB_ID, TAB_ID_HEADER } from '@/lib/realtime';

describe('InvoiceForm', () => {
    // Cleanup in afterEach, not at the end of a test: it runs even when an assertion fails,
    // so a failing test can't leak its spies or listeners into the next ones
    afterEach(() => {
        vi.restoreAllMocks();
        server.events.removeAllListeners();
    });

    it('shows the validation errors and sends nothing when the form is empty', async () => {
        // Record every POST: the assertion "no request was sent" needs a spy on the network
        const onPost = vi.fn();
        server.events.on('request:start', ({ request }) => {
            if (request.method === 'POST') onPost();
        });
        const { user } = renderWithClient(<InvoiceForm />);

        await user.click(screen.getByRole('button', { name: 'Create invoice' }));

        // findBy* = getBy* + waiting (retries until found or 1s timeout): validation is async
        expect(await screen.findByText('Client is required')).toBeInTheDocument();
        expect(screen.getByText('Amount is required')).toBeInTheDocument();
        expect(onPost).not.toHaveBeenCalled();
    });

    it('formats the amount with 2 decimals when leaving the field', () => {
        renderWithClient(<InvoiceForm />);
        // getByLabelText finds the input through its <label>: it also proves the label is
        // correctly linked (htmlFor / id), which matters for screen readers
        const amount = screen.getByLabelText('Amount');

        // fireEvent instead of userEvent ON PURPOSE: for <input type="number">, user-event
        // keeps its own copy of what the user typed and writes it back on focusout, which
        // overwrites our '250.00'. A test-tool quirk, the real browser is fine (the E2E test
        // checks it). React's onBlur listens to 'focusout', hence focusOut and not blur
        fireEvent.change(amount, { target: { value: '250' } });
        fireEvent.focusOut(amount);

        expect(amount).toHaveDisplayValue('250.00');
    });

    it('posts the invoice, tagged with the tab id, then calls onSuccess', async () => {
        let sentBody: unknown;
        let sentTabId: string | null = null;
        server.use(
            http.post('/api/invoices', async ({ request }) => {
                sentBody = await request.json();
                sentTabId = request.headers.get(TAB_ID_HEADER);
                return HttpResponse.json({ id: 'INV-100' }, { status: 201 });
            }),
        );
        const onSuccess = vi.fn();
        const { user } = renderWithClient(<InvoiceForm onSuccess={onSuccess} />);

        await user.type(screen.getByLabelText('Client'), 'Wayne Enterprises');
        await user.type(screen.getByLabelText('Amount'), '1250.5');
        await user.click(screen.getByRole('button', { name: 'Create invoice' }));

        // waitFor retries the callback until it stops throwing: the request is async
        await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
        // valueAsNumber: the amount is sent as a number, not the string typed by the user
        expect(sentBody).toEqual({ client: 'Wayne Enterprises', amount: 1250.5 });
        expect(sentTabId).toBe(TAB_ID);
    });

    it('shows a server validation error under the matching field', async () => {
        // The server can reject what the client accepted (e.g. a uniqueness rule)
        server.use(
            http.post('/api/invoices', () =>
                HttpResponse.json(
                    { message: 'This client is blocked', field: 'client' },
                    { status: 400 },
                ),
            ),
        );
        // The mutation logs failures with console.error: silence it for this expected error
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const onSuccess = vi.fn();
        const { user } = renderWithClient(<InvoiceForm onSuccess={onSuccess} />);

        await user.type(screen.getByLabelText('Client'), 'Umbrella Corp');
        await user.type(screen.getByLabelText('Amount'), '10');
        await user.click(screen.getByRole('button', { name: 'Create invoice' }));

        // Mapped onto the field with setError, not shown as a global error
        expect(await screen.findByText('This client is blocked')).toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it('shows a global error under the form when the server fails', async () => {
        server.use(
            http.post('/api/invoices', () =>
                HttpResponse.json({ message: 'boom' }, { status: 500 }),
            ),
        );
        // The mutation logs failures with console.error: silence it for this expected error
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const { user } = renderWithClient(<InvoiceForm />);

        await user.type(screen.getByLabelText('Client'), 'Acme');
        await user.type(screen.getByLabelText('Amount'), '10');
        await user.click(screen.getByRole('button', { name: 'Create invoice' }));

        // role="alert" on FormError: found by role, like a screen reader would announce it.
        // The text comes from our own mapping (errors.ts), the raw 'boom' is never shown
        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Something went wrong on our end.',
        );
    });
});
