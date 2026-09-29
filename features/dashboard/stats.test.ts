import { describe, expect, it } from 'vitest';
import { sumAmountByStatus } from './stats';
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
