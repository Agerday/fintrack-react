import { describe, expect, it } from 'vitest';
import { normalizeVatNumber, vatNumberError } from './rules';

describe('normalizeVatNumber', () => {
    it('removes the spaces, dots and dashes people copy, and uppercases', () => {
        expect(normalizeVatNumber(' be 0123.456-789 ')).toBe('BE0123456789');
    });
});

describe('vatNumberError', () => {
    it.each(['BE0123456789', 'FRAB123456789', 'NL123456789B01', 'DE123456789', 'XI123456789'])(
        'accepts %s, in the format of its country',
        (vatNumber) => {
            expect(vatNumberError(vatNumber)).toBeUndefined();
        },
    );

    it.each([
        // Right overall length, wrong for the country: Belgium needs 10 digits, Germany 9
        ['BE01234567', 'Enter a valid BE VAT number (e.g. BE0123456789)'],
        ['DE12345678', 'Enter a valid DE VAT number (e.g. DE123456789)'],
        // VIES never uses I or O in the French key
        ['FRIO123456789', 'Enter a valid FR VAT number (e.g. FRXX123456789)'],
    ])('rejects %s with the format of its own country', (vatNumber, message) => {
        expect(vatNumberError(vatNumber)).toBe(message);
    });

    it('points Greek users to the EL prefix', () => {
        expect(vatNumberError('GR123456789')).toBe('Greek VAT numbers start with EL, not GR');
    });

    it.each(['0123456789', 'XX0123456789'])('asks for an EU country code in %s', (vatNumber) => {
        expect(vatNumberError(vatNumber)).toBe('Start with an EU country code (e.g. BE0123456789)');
    });
});
