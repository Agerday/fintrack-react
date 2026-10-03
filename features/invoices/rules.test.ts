import { describe, expect, it } from 'vitest';
import { canChangeStatus, createInvoice, recentInvoices } from './rules';
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
