import { describe, expect, it } from 'vitest';
import { companySchema } from './schema';

const company = {
    name: 'Acme',
    address: '1 Main Street',
    postalCode: '1000',
    city: 'Brussels',
    country: 'Belgium',
    vatNumber: 'BE0123456789',
};

function parseVat(vatNumber: string) {
    return companySchema.safeParse({ ...company, vatNumber });
}

describe('companySchema', () => {
    it('normalizes a lowercase VAT number with surrounding spaces', () => {
        expect(parseVat('  be0123456789 ').data?.vatNumber).toBe('BE0123456789');
    });

    it.each(['0123456789', 'BE123', 'BE0123456789012', 'BE 0123 456 789'])(
        'rejects %s as VAT number',
        (vatNumber) => {
            expect(parseVat(vatNumber).error?.issues[0]?.message).toBe(
                'Enter a valid VAT number (e.g. BE0123456789)',
            );
        },
    );
});
