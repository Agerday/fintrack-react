// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DELETE, GET, PATCH } from './route';
import { invoiceStore } from '../store';
import type { Invoice } from '@/features/invoices/types';
import { publishEvent } from '@/lib/realtime';
import { buildInvoice } from '@/test/factories';

vi.mock('@/lib/realtime', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@/lib/realtime')>()),
    publishEvent: vi.fn(),
}));

// Next passes dynamic params as a Promise
function context(id: string) {
    return { params: Promise.resolve({ id }) };
}

function patchRequest(body: unknown) {
    return new Request('http://localhost/api/invoices/any', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

const request = new Request('http://localhost/api/invoices/any');

describe('/api/invoices/[id]', () => {
    let invoice: Invoice;

    beforeEach(() => {
        invoice = buildInvoice({ status: 'pending' });
        invoiceStore.invoices = [invoice, buildInvoice()];
    });

    describe('GET', () => {
        it('returns the invoice', async () => {
            const response = await GET(request, context(invoice.id));

            expect(response.status).toBe(200);
            expect(await response.json()).toEqual(invoice);
        });

        it('returns a 404 for an unknown id', async () => {
            const response = await GET(request, context('INV-UNKNOWN'));

            expect(response.status).toBe(404);
            expect(await response.json()).toEqual({ message: 'Invoice not found' });
        });
    });

    describe('PATCH', () => {
        it('updates only the sent fields and returns the full invoice', async () => {
            const response = await PATCH(patchRequest({ status: 'paid' }), context(invoice.id));

            expect(response.status).toBe(200);
            expect(await response.json()).toEqual({ ...invoice, status: 'paid' });
            expect(invoiceStore.invoices[0]).toEqual({ ...invoice, status: 'paid' });
        });

        it('announces the update to the other tabs', async () => {
            const patch = patchRequest({ status: 'paid' });

            await PATCH(patch, context(invoice.id));

            expect(publishEvent).toHaveBeenCalledWith(patch, {
                type: 'invoice.updated',
                id: invoice.id,
            });
        });

        it('rejects an unknown status with a 400 naming the field', async () => {
            const response = await PATCH(
                patchRequest({ status: 'cancelled' }),
                context(invoice.id),
            );

            expect(response.status).toBe(400);
            expect(await response.json()).toMatchObject({ field: 'status' });
            expect(invoiceStore.invoices[0]).toEqual(invoice);
        });

        it('returns a 404 for an unknown id', async () => {
            const response = await PATCH(patchRequest({ status: 'paid' }), context('INV-UNKNOWN'));

            expect(response.status).toBe(404);
        });
    });

    describe('DELETE', () => {
        it('removes the invoice and announces it to the other tabs', async () => {
            const response = await DELETE(request, context(invoice.id));

            expect(response.status).toBe(200);
            expect(invoiceStore.invoices).not.toContainEqual(invoice);
            expect(publishEvent).toHaveBeenCalledWith(request, {
                type: 'invoice.deleted',
                id: invoice.id,
            });
        });

        it('returns a 404 and deletes nothing for an unknown id', async () => {
            const response = await DELETE(request, context('INV-UNKNOWN'));

            expect(response.status).toBe(404);
            expect(invoiceStore.invoices).toHaveLength(2);
        });
    });
});
