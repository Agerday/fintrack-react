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

// The account was credited with the amount of a paid invoice, for this client: changing either
// would leave the account out of step with the invoice. Status-only updates stay allowed
export function canEditInvoice(
    status: InvoiceStatus,
    changes: Partial<Pick<Invoice, 'client' | 'amount'>>,
): boolean {
    return status !== 'paid' || (changes.client === undefined && changes.amount === undefined);
}

// Invoices are stored in creation order: the last ones are the newest
export function recentInvoices<T>(invoices: T[], count = 5): T[] {
    return invoices.slice(-count).reverse();
}

// The account is credited once per invoice: only when the status actually changes to paid,
// not on a repeated paid -> paid update
export function isNewPayment(from: InvoiceStatus, to: InvoiceStatus | undefined): boolean {
    return from !== 'paid' && to === 'paid';
}

// A paid invoice backs a transaction on the bank account: deleting it would leave money
// with no invoice behind it
export function canDeleteInvoice(status: InvoiceStatus): boolean {
    return status !== 'paid';
}
