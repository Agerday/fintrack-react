import { http, HttpResponse } from 'msw';
import { companySchema } from '@/features/company/schema';
import type { Company } from '@/features/company/types';

const defaultCompany: Company = {
    name: 'Test Company',
    address: '1 Test Street',
    postalCode: '1000',
    city: 'Brussels',
    country: 'Belgium',
    vatNumber: 'BE0123456789',
};

// Mirrors app/api/company: same status codes and body shapes, validated with the same schema
export const companyDb = {
    company: { ...defaultCompany },
    reset() {
        this.company = { ...defaultCompany };
    },
};

export const companyHandlers = [
    http.get('/api/company', () => HttpResponse.json(companyDb.company)),

    http.put('/api/company', async ({ request }) => {
        const result = companySchema.safeParse(await request.json());
        if (!result.success) {
            const issue = result.error.issues[0];
            return HttpResponse.json(
                { message: issue.message, field: String(issue.path[0]) },
                { status: 400 },
            );
        }

        companyDb.company = result.data;
        return HttpResponse.json(companyDb.company);
    }),
];
