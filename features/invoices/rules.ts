import type { InvoiceFormValues } from './schema';
import type { Invoice, InvoiceStatus } from './types';

export function createInvoice(data: InvoiceFormValues, now: Date): Invoice {
    return {
        id: `INV-${now.getTime()}`,
        ...data,
        date: now.toISOString(),
        status: 'pending',
    };
}

export function canChangeStatus(from: InvoiceStatus, to: InvoiceStatus): boolean {
    return from !== 'paid' || to === 'paid';
}

export function canEditInvoice(
    status: InvoiceStatus,
    changes: Partial<Pick<Invoice, 'client' | 'amount'>>,
): boolean {
    return status !== 'paid' || (changes.client === undefined && changes.amount === undefined);
}

export function recentInvoices<T>(invoices: T[], count = 5): T[] {
    return invoices.slice(-count).reverse();
}

export function isNewPayment(from: InvoiceStatus, to: InvoiceStatus | undefined): boolean {
    return from !== 'paid' && to === 'paid';
}

export function canDeleteInvoice(status: InvoiceStatus): boolean {
    return status !== 'paid';
}
