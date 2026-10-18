import { type ListPage, listLinks, matchesSearch, paginate, sortBy } from '@/lib/list-params';
import {
    defaultInvoiceListParams,
    type InvoiceFormValues,
    type InvoiceListParams,
    type InvoiceSortKey,
} from './schema';
import type { Invoice, InvoiceStatus } from './types';

export const INVOICES_PAGE_SIZE = 10;

// Dates are compared as timestamps: the seed has "Sep 26, 2026", new invoices an ISO string,
// sorting the raw strings would mix them up
const sortValues: Record<InvoiceSortKey, (invoice: Invoice) => string | number> = {
    date: (invoice) => Date.parse(invoice.date),
    client: (invoice) => invoice.client,
    amount: (invoice) => invoice.amount,
};

// The page of invoices the list shows for the URL params. Runs on the cached full list, not on
// the server: the optimistic payment and the live events keep working on every view
export function queryInvoices(invoices: Invoice[], params: InvoiceListParams): ListPage<Invoice> {
    const matching = invoices.filter(
        (invoice) =>
            (params.status === 'all' || invoice.status === params.status) &&
            matchesSearch([invoice.id, invoice.client], params.q),
    );
    const sorted = sortBy(matching, sortValues[params.sort], params.dir);
    return paginate(sorted, params.page, INVOICES_PAGE_SIZE);
}

// A to Z for the client, biggest / newest first for the figures
export const { href: invoiceListHref, sortHref: invoiceSortHref } = listLinks<
    InvoiceSortKey,
    InvoiceListParams
>('/invoices', defaultInvoiceListParams, { date: 'desc', client: 'asc', amount: 'desc' });

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
