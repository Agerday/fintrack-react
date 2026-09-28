// UNIT TEST: one pure piece of logic, no DOM, no network. The fastest and most stable kind
// of test, so business rules (here: validation) are best checked at this level.
//
// Vitest API = Jasmine/Jest API: describe / it / expect. `globals: true` would make them
// available without imports, but explicit imports keep TypeScript and the reader happy.
import { describe, expect, it } from 'vitest';
import { invoiceEventSchema, invoiceSchema, invoiceUpdateSchema } from './schema';

// safeParse never throws: it returns { success, data } or { success, error }.
// This helper extracts the first error message to keep the assertions short
function firstError(result: { success: boolean; error?: { issues: { message: string }[] } }) {
    return result.error?.issues[0]?.message;
}

describe('invoiceSchema (create form + POST body)', () => {
    it('accepts a valid invoice', () => {
        const result = invoiceSchema.safeParse({ client: 'Acme', amount: 120.5 });

        expect(result.success).toBe(true);
    });

    it('trims the client name', () => {
        // .trim() in the schema is a transformation: the parsed data differs from the input
        const result = invoiceSchema.parse({ client: '  Acme  ', amount: 10 });

        expect(result.client).toBe('Acme');
    });

    it('rejects a blank client name', () => {
        // Only spaces -> trimmed to '' -> min(1) fails. Without trim() this would pass
        const result = invoiceSchema.safeParse({ client: '   ', amount: 10 });

        expect(firstError(result)).toBe('Client is required');
    });

    // it.each runs the same test with several inputs (like a JUnit @ParameterizedTest).
    // $label is replaced in the test name, so each case shows up separately in the report
    it.each([
        { label: 'zero', amount: 0 },
        { label: 'a negative number', amount: -50 },
    ])('rejects $label as amount', ({ amount }) => {
        const result = invoiceSchema.safeParse({ client: 'Acme', amount });

        expect(firstError(result)).toBe('Amount must be greater than 0');
    });

    it.each([
        // An empty number input with valueAsNumber gives NaN, not undefined
        { label: 'NaN (empty number input)', amount: Number.NaN },
        { label: 'a missing amount', amount: undefined },
        { label: 'a string', amount: '12' },
    ])('rejects $label with "Amount is required"', ({ amount }) => {
        const result = invoiceSchema.safeParse({ client: 'Acme', amount });

        expect(firstError(result)).toBe('Amount is required');
    });
});

describe('invoiceUpdateSchema (PATCH body)', () => {
    it('accepts an empty object: every field is optional', () => {
        expect(invoiceUpdateSchema.safeParse({}).success).toBe(true);
    });

    it('accepts a status change alone', () => {
        expect(invoiceUpdateSchema.parse({ status: 'paid' })).toEqual({ status: 'paid' });
    });

    it('rejects an unknown status', () => {
        const result = invoiceUpdateSchema.safeParse({ status: 'cancelled' });

        expect(result.success).toBe(false);
        // path tells WHICH field failed: the Route Handler sends it back as `field`
        expect(result.error?.issues[0]?.path).toEqual(['status']);
    });

    it('still validates the fields that are present', () => {
        // .partial() makes fields optional, it doesn't remove their rules
        const result = invoiceUpdateSchema.safeParse({ amount: -1 });

        expect(firstError(result)).toBe('Amount must be greater than 0');
    });
});

describe('invoiceEventSchema (WebSocket messages)', () => {
    it('accepts an event without sourceId', () => {
        const event = { type: 'invoice.created', id: 'INV-001' };

        expect(invoiceEventSchema.parse(event)).toEqual(event);
    });

    it('rejects an unknown event type', () => {
        const result = invoiceEventSchema.safeParse({ type: 'invoice.archived', id: 'INV-001' });

        expect(result.success).toBe(false);
    });

    it('rejects an event without id', () => {
        expect(invoiceEventSchema.safeParse({ type: 'invoice.deleted' }).success).toBe(false);
    });
});
