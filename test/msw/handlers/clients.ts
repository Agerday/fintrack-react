import { http, HttpResponse } from 'msw';
import { clientSchema } from '@/features/clients/schema';
import { createClient, emailExists, withInvoiceStats } from '@/features/clients/rules';
import type { ClientRecord } from '@/features/clients/types';
import { invoiceDb } from './invoices';

// Mirrors app/api/clients: same status codes and body shapes, validated with the same schema.
// Starts empty: each test arranges the clients it needs. Figures come from the invoices handler
export const clientDb = {
    clients: [] as ClientRecord[],
    reset() {
        this.clients = [];
    },
};

export const clientHandlers = [
    http.get('/api/clients', () =>
        HttpResponse.json(withInvoiceStats(clientDb.clients, invoiceDb.invoices)),
    ),

    http.get('/api/clients/check-email', ({ request }) => {
        const email = new URL(request.url).searchParams.get('email');
        if (!email) {
            return HttpResponse.json(
                { message: 'Email is required', field: 'email' },
                { status: 400 },
            );
        }
        return HttpResponse.json({ exists: emailExists(clientDb.clients, email) });
    }),

    http.post('/api/clients', async ({ request }) => {
        const result = clientSchema.safeParse(await request.json());
        if (!result.success) {
            const issue = result.error.issues[0];
            return HttpResponse.json(
                { message: issue.message, field: String(issue.path[0]) },
                { status: 400 },
            );
        }
        if (emailExists(clientDb.clients, result.data.email)) {
            return HttpResponse.json(
                { message: 'Email already exists', field: 'email' },
                { status: 409 },
            );
        }

        const created = createClient(result.data, new Date());
        clientDb.clients = [...clientDb.clients, created];
        const [client] = withInvoiceStats([created], invoiceDb.invoices);
        return HttpResponse.json(client, { status: 201 });
    }),
];
