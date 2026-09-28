// @vitest-environment node
// ^ Server code: run in plain Node instead of jsdom (no DOM needed, closer to production).
//
// INTEGRATION TEST of the Route Handlers: we call the exported GET / POST functions
// directly with a real Request object. No HTTP server is started, but everything behind
// the function runs for real: withErrorHandling + parseBody + Zod schema + store.
// Spring analogy: a @WebMvcTest calling the controller through MockMvc.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from './route';
import { invoiceStore } from './store';
import { invoices as seedInvoices } from '@/features/invoices/data';
import { publishEvent } from '@/lib/realtime';

// vi.mock replaces a whole module for this test file (hoisted above the imports).
// We keep the real module (importOriginal) and only swap publishEvent for a mock:
// the real one would POST to the WebSocket server, which is not the subject here
vi.mock('@/lib/realtime', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@/lib/realtime')>()),
    publishEvent: vi.fn(),
}));

function postRequest(body: unknown, headers: Record<string, string> = {}) {
    return new Request('http://localhost/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: typeof body === 'string' ? body : JSON.stringify(body),
    });
}

describe('/api/invoices', () => {
    // The store is module-level state shared by every test of this file:
    // reset it so tests don't depend on each other's order
    beforeEach(() => {
        invoiceStore.invoices = [...seedInvoices];
        vi.mocked(publishEvent).mockClear();
    });

    describe('GET', () => {
        it('returns every invoice of the store', async () => {
            const response = await GET();

            expect(response.status).toBe(200);
            expect(await response.json()).toEqual(seedInvoices);
        });
    });

    describe('POST', () => {
        it('creates a pending invoice and returns 201', async () => {
            const response = await POST(postRequest({ client: 'Wayne Enterprises', amount: 500 }));

            expect(response.status).toBe(201);
            const created = invoiceStore.invoices.at(-1);
            // toMatchObject: only checks the listed properties (id and date are generated)
            expect(created).toMatchObject({
                client: 'Wayne Enterprises',
                amount: 500,
                status: 'pending',
            });
            expect(invoiceStore.invoices).toHaveLength(seedInvoices.length + 1);
        });

        it('publishes an "invoice.created" event with the new id', async () => {
            const request = postRequest({ client: 'Wayne Enterprises', amount: 500 });

            await POST(request);

            const created = invoiceStore.invoices.at(-1);
            expect(publishEvent).toHaveBeenCalledWith(request, {
                type: 'invoice.created',
                id: created?.id,
            });
        });

        it('returns 400 with the failing field when the body is invalid', async () => {
            const response = await POST(postRequest({ client: '', amount: 500 }));

            // This { message, field } shape is what the form uses to highlight the right input
            expect(response.status).toBe(400);
            expect(await response.json()).toEqual({
                message: 'Client is required',
                field: 'client',
            });
            // Nothing saved, nothing published
            expect(invoiceStore.invoices).toHaveLength(seedInvoices.length);
            expect(publishEvent).not.toHaveBeenCalled();
        });

        it('returns 400 when the body is not JSON', async () => {
            const response = await POST(postRequest('{ broken json'));

            expect(response.status).toBe(400);
            expect(await response.json()).toMatchObject({ message: 'Invalid JSON body' });
        });
    });
});
