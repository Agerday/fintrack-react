// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from './route';
import { invoiceStore } from './store';
import { publishEvent } from '@/lib/realtime';
import { buildInvoice } from '@/test/factories';

// Leaves the process (POST to the socket server): a real boundary
vi.mock('@/lib/realtime', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@/lib/realtime')>()),
    publishEvent: vi.fn(),
}));

function postRequest(body: unknown) {
    return new Request('http://localhost/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: typeof body === 'string' ? body : JSON.stringify(body),
    });
}

describe('/api/invoices', () => {
    beforeEach(() => {
        invoiceStore.invoices = [buildInvoice(), buildInvoice()];
    });

    it('lists every invoice of the store', async () => {
        const response = await GET();

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual(invoiceStore.invoices);
    });

    it('creates a pending invoice and returns it with a 201', async () => {
        const response = await POST(postRequest({ client: 'Wayne Enterprises', amount: 500 }));

        expect(response.status).toBe(201);
        const created = await response.json();
        expect(created).toMatchObject({
            client: 'Wayne Enterprises',
            amount: 500,
            status: 'pending',
        });
        expect(invoiceStore.invoices).toContainEqual(created);
    });

    it('announces the created invoice to the other tabs', async () => {
        const request = postRequest({ client: 'Wayne Enterprises', amount: 500 });

        const created = await (await POST(request)).json();

        expect(publishEvent).toHaveBeenCalledWith(request, {
            type: 'invoice.created',
            id: created.id,
        });
    });

    it('rejects an invalid body with a 400 naming the field, and saves nothing', async () => {
        const before = [...invoiceStore.invoices];

        const response = await POST(postRequest({ client: '', amount: 500 }));

        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({ message: 'Client is required', field: 'client' });
        expect(invoiceStore.invoices).toEqual(before);
        expect(publishEvent).not.toHaveBeenCalled();
    });

    it('rejects a body that is not JSON with a 400', async () => {
        const response = await POST(postRequest('{ broken json'));

        expect(response.status).toBe(400);
        expect(await response.json()).toMatchObject({ message: 'Invalid JSON body' });
    });
});
