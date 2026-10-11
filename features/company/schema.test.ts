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
    it('saves a VAT number written with separators in its normalized form', () => {
        expect(parseVat(' be 0123.456.789 ').data?.vatNumber).toBe('BE0123456789');
    });

    it('rejects an invalid VAT number on its field, with the message of its country', () => {
        expect(parseVat('BE01234567').error?.issues[0]).toMatchObject({
            path: ['vatNumber'],
            message: 'Enter a valid BE VAT number (e.g. BE0123456789)',
        });
    });
});
