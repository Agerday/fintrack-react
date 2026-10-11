// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest';
import { GET } from './route';
import { clientStore } from './store';
import { invoiceStore } from '@/app/api/invoices/store';
import { buildClient, buildInvoice } from '@/test/factories';

describe('/api/clients', () => {
    beforeEach(() => {
        clientStore.clients = [];
        invoiceStore.invoices = [];
    });

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
