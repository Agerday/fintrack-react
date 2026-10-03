import type { InvoiceFormValues } from './schema';
import type { Invoice, InvoiceStatus } from './types';

// Business rules of invoices: pure functions, no React / fetch / store, so the Route Handlers,
// the MSW handlers and the UI all apply the same rules (like a Spring @Service, minus the class)

// `now` is a parameter, not new Date() inside: the rule stays pure and testable
export function createInvoice(data: InvoiceFormValues, now: Date): Invoice {
    return {
        id: `INV-${now.getTime()}`,
        ...data,
        date: now.toISOString(),
        status: 'pending',
    };
}

// Paid is final: money received can't become unpaid again
export function canChangeStatus(from: InvoiceStatus, to: InvoiceStatus): boolean {
    return from !== 'paid' || to === 'paid';
}

// Invoices are stored in creation order: the last ones are the newest
export function recentInvoices<T>(invoices: T[], count = 5): T[] {
    return invoices.slice(-count).reverse();
}
