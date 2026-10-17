import { listHref, matchesSearch } from '@/lib/list-params';
import { defaultInvoiceListParams, type InvoiceFormValues, type InvoiceListParams } from './schema';
import type { Invoice, InvoiceStatus } from './types';

// The invoices the list shows for the URL params. Runs on the cached full list, not on the
// server: the optimistic payment and the live events keep working on every view
export function queryInvoices(invoices: Invoice[], params: InvoiceListParams): Invoice[] {
    return invoices.filter(
        (invoice) =>
            (params.status === 'all' || invoice.status === params.status) &&
            matchesSearch([invoice.id, invoice.client], params.q),
    );
}

// Link to the list with some params changed, the others kept
export function invoiceListHref(
    params: InvoiceListParams,
    changes: Partial<InvoiceListParams>,
): string {
    return listHref('/invoices', { ...params, ...changes }, defaultInvoiceListParams);
}

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
