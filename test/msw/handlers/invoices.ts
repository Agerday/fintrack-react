import { http, HttpResponse, ws } from 'msw';
import type { z } from 'zod';
import { invoiceSchema, invoiceUpdateSchema } from '@/features/invoices/schema';
import { canChangeStatus } from '@/features/invoices/rules';
import type { Invoice } from '@/features/invoices/types';
import { WS_URL } from '@/lib/realtime';
import { buildInvoice } from '@/test/factories';

// Mirrors app/api/invoices: same status codes and body shapes, validated with the same schemas.
// Starts empty: each test arranges the invoices it needs
export const invoiceDb = {
    invoices: [] as Invoice[],
    reset() {
        this.invoices = [];
    },
};

// Tests push server events with invoiceEvents.broadcast(...)
export const invoiceEvents = ws.link(WS_URL);

// Same body as parseBody + withErrorHandling
function validationError(error: z.ZodError) {
    const issue = error.issues[0];
    const field = issue.path[0];
    return HttpResponse.json(
        { message: issue.message, field: field === undefined ? undefined : String(field) },
        { status: 400 },
    );
}

function notFound() {
    return HttpResponse.json({ message: 'Invoice not found' }, { status: 404 });
}

export const invoiceHandlers = [
    http.get('/api/invoices', () => HttpResponse.json(invoiceDb.invoices)),

    http.post('/api/invoices', async ({ request }) => {
        const result = invoiceSchema.safeParse(await request.json());
        if (!result.success) return validationError(result.error);

        const invoice = buildInvoice({
            ...result.data,
            date: new Date().toISOString(),
            status: 'pending',
        });
        invoiceDb.invoices = [...invoiceDb.invoices, invoice];
        return HttpResponse.json(invoice, { status: 201 });
    }),

    http.get('/api/invoices/:id', ({ params }) => {
        const invoice = invoiceDb.invoices.find((i) => i.id === params.id);
        return invoice ? HttpResponse.json(invoice) : notFound();
    }),

    http.patch('/api/invoices/:id', async ({ params, request }) => {
        const result = invoiceUpdateSchema.safeParse(await request.json());
        if (!result.success) return validationError(result.error);

        const invoice = invoiceDb.invoices.find((i) => i.id === params.id);
        if (!invoice) return notFound();

        if (result.data.status && !canChangeStatus(invoice.status, result.data.status)) {
            return HttpResponse.json(
                { message: 'A paid invoice cannot change status' },
                { status: 409 },
            );
        }

        const updated = { ...invoice, ...result.data };
        invoiceDb.invoices = invoiceDb.invoices.map((i) => (i.id === updated.id ? updated : i));
        return HttpResponse.json(updated);
    }),

    http.delete('/api/invoices/:id', ({ params }) => {
        if (!invoiceDb.invoices.some((i) => i.id === params.id)) return notFound();

        invoiceDb.invoices = invoiceDb.invoices.filter((i) => i.id !== params.id);
        return HttpResponse.json({ success: true });
    }),

    // Accept connections so components using useInvoiceEvents mount without a socket server
    invoiceEvents.addEventListener('connection', () => {}),
];
