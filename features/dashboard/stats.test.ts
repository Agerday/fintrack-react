import { describe, expect, it } from 'vitest';
import { collectionRate, sumAmountByClient, sumAmountByStatus } from './stats';
import { buildInvoice } from '@/test/factories';

describe('sumAmountByStatus', () => {
    it('adds up the amounts of each status', () => {
        const invoices = [
            buildInvoice({ status: 'paid', amount: 2400 }),
            buildInvoice({ status: 'paid', amount: 100.5 }),
            buildInvoice({ status: 'overdue', amount: 980 }),
        ];

        expect(sumAmountByStatus(invoices)).toEqual([
            { status: 'paid', total: 2500.5 },
            { status: 'pending', total: 0 },
            { status: 'overdue', total: 980 },
        ]);
    });
});

describe('collectionRate', () => {
    it('returns the share of the invoiced amount that is paid', () => {
        const amountByStatus = sumAmountByStatus([
            buildInvoice({ status: 'paid', amount: 300 }),
            buildInvoice({ status: 'pending', amount: 100 }),
            buildInvoice({ status: 'overdue', amount: 600 }),
        ]);

        expect(collectionRate(amountByStatus)).toBe(0.3);
    });

    it('returns 0 when nothing is invoiced', () => {
        expect(collectionRate(sumAmountByStatus([]))).toBe(0);
    });
});

describe('sumAmountByClient', () => {
    it('adds up the amounts of each client, highest first', () => {
        const invoices = [
            buildInvoice({ client: 'Initech', amount: 500 }),
            buildInvoice({ client: 'Acme', amount: 300 }),
            buildInvoice({ client: 'Acme', amount: 400.5 }),
        ];

        expect(sumAmountByClient(invoices)).toEqual([
            { client: 'Acme', total: 700.5 },
            { client: 'Initech', total: 500 },
        ]);
    });

    it('keeps only the top clients', () => {
        const invoices = [
            buildInvoice({ client: 'Small', amount: 10 }),
            buildInvoice({ client: 'Big', amount: 1000 }),
            buildInvoice({ client: 'Medium', amount: 100 }),
        ];

        expect(sumAmountByClient(invoices, 2).map(({ client }) => client)).toEqual([
            'Big',
            'Medium',
        ]);
    });
});
