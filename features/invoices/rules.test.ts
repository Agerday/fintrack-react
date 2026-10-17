import { describe, expect, it } from 'vitest';
import {
    canChangeStatus,
    canEditInvoice,
    createInvoice,
    isNewPayment,
    queryInvoices,
    recentInvoices,
} from './rules';
import { defaultInvoiceListParams } from './schema';
import { buildInvoice } from '@/test/factories';

describe('createInvoice', () => {
    it('starts as pending, dated now', () => {
        const now = new Date('2026-10-03T10:00:00.000Z');

        const invoice = createInvoice({ client: 'Acme', amount: 500 }, now);

        expect(invoice).toMatchObject({
            client: 'Acme',
            amount: 500,
            status: 'pending',
            date: '2026-10-03T10:00:00.000Z',
        });
    });
});

describe('canChangeStatus', () => {
    it('lets an unpaid invoice be paid', () => {
        expect(canChangeStatus('pending', 'paid')).toBe(true);
        expect(canChangeStatus('overdue', 'paid')).toBe(true);
    });

    it('never lets a paid invoice go back to unpaid', () => {
        expect(canChangeStatus('paid', 'pending')).toBe(false);
        expect(canChangeStatus('paid', 'overdue')).toBe(false);
    });
});

describe('canEditInvoice', () => {
    it('lets the client and amount of an unpaid invoice change', () => {
        expect(canEditInvoice('pending', { client: 'Globex', amount: 10 })).toBe(true);
    });

    it('freezes the client and amount of a paid invoice, as the account holds its amount', () => {
        expect(canEditInvoice('paid', { amount: 10 })).toBe(false);
        expect(canEditInvoice('paid', { client: 'Globex' })).toBe(false);
    });

    it('still accepts a status-only update on a paid invoice', () => {
        expect(canEditInvoice('paid', {})).toBe(true);
    });
});

describe('isNewPayment', () => {
    it('counts an unpaid invoice becoming paid as a payment', () => {
        expect(isNewPayment('pending', 'paid')).toBe(true);
        expect(isNewPayment('overdue', 'paid')).toBe(true);
    });

    it('does not count a paid invoice saved as paid again, so it is never credited twice', () => {
        expect(isNewPayment('paid', 'paid')).toBe(false);
    });

    it('does not count an update that leaves the invoice unpaid', () => {
        expect(isNewPayment('pending', 'overdue')).toBe(false);
        expect(isNewPayment('pending', undefined)).toBe(false);
    });
});

describe('recentInvoices', () => {
    it('returns the last created invoices, newest first', () => {
        const invoices = [
            buildInvoice({ id: 'INV-1' }),
            buildInvoice({ id: 'INV-2' }),
            buildInvoice({ id: 'INV-3' }),
        ];

        expect(recentInvoices(invoices, 2).map(({ id }) => id)).toEqual(['INV-3', 'INV-2']);
    });
});

describe('queryInvoices', () => {
    it('sorts by date across the seed format and the ISO dates of new invoices', () => {
        const invoices = [
            buildInvoice({ id: 'INV-SEPT', date: 'Sep 30, 2026' }),
            buildInvoice({ id: 'INV-OCT', date: '2026-10-02T09:00:00.000Z' }),
            buildInvoice({ id: 'INV-AUG', date: 'Aug 12, 2026' }),
        ];

        const { items } = queryInvoices(invoices, defaultInvoiceListParams);

        expect(items.map(({ id }) => id)).toEqual(['INV-OCT', 'INV-SEPT', 'INV-AUG']);
    });
});
