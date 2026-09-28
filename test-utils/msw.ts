// MSW (Mock Service Worker) intercepts requests at the network level: the code under test
// calls the real `fetch` / `WebSocket`, MSW answers instead of a server.
// Angular analogy: HttpTestingController, except it also works for fetch, WebSocket and any
// library, because nothing is injected: the network itself is mocked.
import { http, HttpResponse, ws } from 'msw';
import { setupServer } from 'msw/node';
import { invoices as seedInvoices } from '@/features/invoices/data';
import type { Invoice } from '@/features/invoices/types';
import { WS_URL } from '@/lib/realtime';

// A tiny in-memory backend, so a mutation followed by a refetch behaves like the real API
// (delete an invoice -> the next GET no longer returns it). Like angular-in-memory-web-api.
export const invoiceDb = {
    invoices: [...seedInvoices] as Invoice[],
    reset() {
        this.invoices = [...seedInvoices];
    },
};

// WebSocket endpoint mocked by MSW. Tests push server events with invoiceEvents.broadcast(...)
export const invoiceEvents = ws.link(WS_URL);

// Default "happy path" handlers. A test that needs another answer (error, empty list...)
// overrides one with server.use(...), and the override is removed after the test.
// Relative paths like '/api/invoices' are resolved against the jsdom URL (http://localhost:3000)
export const handlers = [
    http.get('/api/invoices', () => HttpResponse.json(invoiceDb.invoices)),

    http.get('/api/invoices/:id', ({ params }) => {
        const invoice = invoiceDb.invoices.find((i) => i.id === params.id);
        return invoice
            ? HttpResponse.json(invoice)
            : HttpResponse.json({ message: 'Invoice not found' }, { status: 404 });
    }),

    http.post('/api/invoices', async ({ request }) => {
        const body = (await request.json()) as Pick<Invoice, 'client' | 'amount'>;
        const invoice: Invoice = {
            id: `INV-TEST-${invoiceDb.invoices.length + 1}`,
            date: '2026-09-28T00:00:00.000Z',
            status: 'pending',
            ...body,
        };
        invoiceDb.invoices = [...invoiceDb.invoices, invoice];
        return HttpResponse.json(invoice, { status: 201 });
    }),

    http.patch('/api/invoices/:id', async ({ params, request }) => {
        const changes = (await request.json()) as Partial<Invoice>;
        invoiceDb.invoices = invoiceDb.invoices.map((i) =>
            i.id === params.id ? { ...i, ...changes } : i,
        );
        return HttpResponse.json({ id: params.id, ...changes });
    }),

    http.delete('/api/invoices/:id', ({ params }) => {
        invoiceDb.invoices = invoiceDb.invoices.filter((i) => i.id !== params.id);
        return HttpResponse.json({ success: true });
    }),

    // Accept WebSocket connections without sending anything: components using
    // useInvoiceEvents can mount without a real socket server
    invoiceEvents.addEventListener('connection', () => {}),
];

// setupServer = the Node.js flavour of MSW (tests run in Node, not in a real browser).
// Started / reset / stopped once for all tests in vitest.setup.ts
export const server = setupServer(...handlers);
