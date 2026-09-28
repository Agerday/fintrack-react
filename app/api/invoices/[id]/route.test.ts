// @vitest-environment node
// INTEGRATION TEST of /api/invoices/[id]. Same approach as ../route.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DELETE, GET, PATCH } from './route';
import { invoiceStore } from '../store';
import { invoices as seedInvoices } from '@/features/invoices/data';
import { publishEvent } from '@/lib/realtime';

vi.mock('@/lib/realtime', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@/lib/realtime')>()),
    publishEvent: vi.fn(),
}));

// Next passes dynamic params as a Promise (Next 15+), so the tests must do the same
function context(id: string) {
    return { params: Promise.resolve({ id }) };
}

function patchRequest(body: unknown) {
    return new Request('http://localhost/api/invoices/x', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

const request = new Request('http://localhost/api/invoices/x');

describe('/api/invoices/[id]', () => {
    beforeEach(() => {
        invoiceStore.invoices = [...seedInvoices];
        vi.mocked(publishEvent).mockClear();
    });

    describe('GET', () => {
        it('returns the invoice', async () => {
            const response = await GET(request, context('INV-001'));

            expect(response.status).toBe(200);
            expect(await response.json()).toEqual(seedInvoices[0]);
        });

        it('returns 404 for an unknown id', async () => {
            const response = await GET(request, context('INV-404'));

            expect(response.status).toBe(404);
            expect(await response.json()).toMatchObject({ message: 'Invoice not found' });
        });
    });

    describe('PATCH', () => {
        it('updates only the sent fields and publishes "invoice.updated"', async () => {
            const response = await PATCH(patchRequest({ status: 'paid' }), context('INV-002'));

            expect(response.status).toBe(200);
            const updated = invoiceStore.invoices.find((i) => i.id === 'INV-002');
            // The other fields are untouched: { ...invoice, ...data } in the handler
            expect(updated).toEqual({ ...seedInvoices[1], status: 'paid' });
            expect(publishEvent).toHaveBeenCalledWith(expect.any(Request), {
                type: 'invoice.updated',
                id: 'INV-002',
            });
        });

        it('does not mutate the previous array (immutability rule of CLAUDE.md)', async () => {
            const before = invoiceStore.invoices;

            await PATCH(patchRequest({ status: 'paid' }), context('INV-002'));

            // A new array was assigned, the old one still holds the old invoice
            expect(invoiceStore.invoices).not.toBe(before);
            expect(before[1].status).toBe(seedInvoices[1].status);
        });

        it('returns 400 with the field name for an invalid status', async () => {
            const response = await PATCH(patchRequest({ status: 'cancelled' }), context('INV-002'));

            expect(response.status).toBe(400);
            expect(await response.json()).toMatchObject({ field: 'status' });
            expect(publishEvent).not.toHaveBeenCalled();
        });

        it('returns 404 for an unknown id', async () => {
            const response = await PATCH(patchRequest({ status: 'paid' }), context('INV-404'));

            expect(response.status).toBe(404);
        });
    });

    describe('DELETE', () => {
        it('removes the invoice and publishes "invoice.deleted"', async () => {
            const response = await DELETE(request, context('INV-001'));

            expect(response.status).toBe(200);
            expect(invoiceStore.invoices.map((i) => i.id)).not.toContain('INV-001');
            expect(publishEvent).toHaveBeenCalledWith(request, {
                type: 'invoice.deleted',
                id: 'INV-001',
            });
        });

        it('returns 404 and keeps the store intact for an unknown id', async () => {
            const response = await DELETE(request, context('INV-404'));

            expect(response.status).toBe(404);
            expect(invoiceStore.invoices).toHaveLength(seedInvoices.length);
        });
    });
});
