// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { POST } from './route';
import { GET as getInvoices } from '@/app/api/invoices/route';
import { GET as getCompany } from '@/app/api/company/route';
import { invoiceStore } from '@/app/api/invoices/store';
import { companyStore } from '@/app/api/company/store';
import { invoices } from '@/features/invoices/data';
import { company } from '@/features/company/data';
import { buildInvoice } from '@/test/factories';

describe('POST /api/demo/reset', () => {
    it('brings back the seed invoices after the user changed them', async () => {
        invoiceStore.invoices = [buildInvoice()];

        await POST();

        const response = await getInvoices();
        expect(await response.json()).toEqual(invoices);
    });

    it('brings back the seed company after the user edited it', async () => {
        companyStore.company = { ...company, name: 'Renamed' };

        await POST();

        const response = await getCompany();
        expect(await response.json()).toEqual(company);
    });
});
