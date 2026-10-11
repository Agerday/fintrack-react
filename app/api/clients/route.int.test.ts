// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest';
import { GET, POST } from './route';
import { clientStore } from './store';
import { invoiceStore } from '@/app/api/invoices/store';
import { buildClient, buildInvoice } from '@/test/factories';

function postRequest(body: unknown) {
    return new Request('http://localhost/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

describe('/api/clients', () => {
    beforeEach(() => {
        clientStore.clients = [];
        invoiceStore.invoices = [];
    });

    describe('GET', () => {
        it('returns each client with the count and total of its current invoices', async () => {
            const acme = buildClient({ name: 'Acme' });
            clientStore.clients = [acme];
            invoiceStore.invoices = [
                buildInvoice({ client: 'Acme', amount: 2400 }),
                buildInvoice({ client: 'Acme', amount: 600 }),
            ];

            const response = await GET();

            expect(response.status).toBe(200);
            expect(await response.json()).toEqual([{ ...acme, invoices: 2, total: 3000 }]);
        });
    });

    describe('POST', () => {
        it('returns the created client only, with the invoices already addressed to it', async () => {
            clientStore.clients = [buildClient()];
            invoiceStore.invoices = [buildInvoice({ client: 'Wayne', amount: 500 })];

            const response = await POST(
                postRequest({
                    name: 'Wayne',
                    email: 'bruce@wayne.com',
                    countryCode: 'BE',
                    phone: '470123456',
                    company: 'Wayne Enterprises',
                }),
            );

            expect(response.status).toBe(201);
            expect(await response.json()).toMatchObject({
                name: 'Wayne',
                email: 'bruce@wayne.com',
                invoices: 1,
                total: 500,
            });
        });
    });
});
