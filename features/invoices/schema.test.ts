import { describe, expect, it } from 'vitest';
import { invoiceSchema, parseInvoiceListParams } from './schema';

function errorFor(input: unknown) {
    return invoiceSchema.safeParse(input).error?.issues[0]?.message;
}

describe('invoiceSchema', () => {
    it('accepts a client and an amount with up to 2 decimals', () => {
        expect(invoiceSchema.safeParse({ client: 'Acme', amount: 1250.5 }).success).toBe(true);
        expect(invoiceSchema.safeParse({ client: 'Acme', amount: 0.29 }).success).toBe(true);
    });

    it('rejects a client name made only of spaces', () => {
        expect(errorFor({ client: '   ', amount: 10 })).toBe('Client is required');
    });

    it.each([0, -50])('rejects %d as amount', (amount) => {
        expect(errorFor({ client: 'Acme', amount })).toBe('Amount must be greater than 0');
    });

    // An emptied <input type="number"> registered with valueAsNumber gives NaN, not undefined
    it('asks for an amount when the number input was left empty', () => {
        expect(errorFor({ client: 'Acme', amount: Number.NaN })).toBe('Amount is required');
    });

    it('rejects an amount with more than 2 decimals', () => {
        expect(errorFor({ client: 'Acme', amount: 12.345 })).toBe(
            'Amount can have at most 2 decimals',
        );
    });
});

describe('parseInvoiceListParams', () => {
    it('falls back to the defaults for a hand-edited URL instead of failing the page', () => {
        expect(parseInvoiceListParams({ q: ['a', 'b'], status: 'archived' })).toEqual({
            q: '',
            status: 'all',
        });
    });

    it('trims the search', () => {
        expect(parseInvoiceListParams({ q: '  acme ', status: 'paid' })).toEqual({
            q: 'acme',
            status: 'paid',
        });
    });
});
