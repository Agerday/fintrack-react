// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest';
import { GET, PUT } from './route';
import { companyStore } from './store';

function putRequest(body: unknown) {
    return new Request('http://localhost/api/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

const company = {
    name: 'Acme',
    address: '1 Main Street',
    postalCode: '1000',
    city: 'Brussels',
    country: 'Belgium',
    vatNumber: 'BE0123456789',
};

describe('/api/company', () => {
    beforeEach(() => {
        companyStore.company = { ...company };
    });

    it('returns the company', async () => {
        const response = await GET();

        expect(await response.json()).toEqual(company);
    });

    it('saves the new company and returns it', async () => {
        const updated = { ...company, city: 'Ghent' };

        const response = await PUT(putRequest(updated));

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual(updated);
        expect(companyStore.company).toEqual(updated);
    });

    it('rejects an invalid VAT number with a 400 naming the field, and saves nothing', async () => {
        const response = await PUT(putRequest({ ...company, vatNumber: '123' }));

        expect(response.status).toBe(400);
        expect(await response.json()).toMatchObject({ field: 'vatNumber' });
        expect(companyStore.company).toEqual(company);
    });
});
