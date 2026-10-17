import { z } from 'zod';
import { hasAtMostTwoDecimals } from '@/lib/money';
import { pageParam, type RawSearchParams, searchParam, sortParams } from '@/lib/list-params';

export const invoiceStatuses = ['paid', 'pending', 'overdue'] as const;
export const invoiceStatusSchema = z.enum(invoiceStatuses);

export const invoiceSortKeys = ['date', 'client', 'amount'] as const;

export type InvoiceSortKey = (typeof invoiceSortKeys)[number];

// The invoice list state read from the URL (?q=acme&status=paid&sort=amount&page=2), see
// lib/list-params.ts. Newest first by default
export const invoiceListParamsSchema = z.object({
    q: searchParam,
    status: z.enum(['all', ...invoiceStatuses]).catch('all'),
    ...sortParams(invoiceSortKeys, 'date', 'desc'),
    page: pageParam,
});

export type InvoiceListParams = z.infer<typeof invoiceListParamsSchema>;

export const defaultInvoiceListParams = invoiceListParamsSchema.parse({});

export function parseInvoiceListParams(searchParams: RawSearchParams): InvoiceListParams {
    return invoiceListParamsSchema.parse(searchParams);
}

export const invoiceSchema = z.object({
    client: z.string().trim().min(1, 'Client is required'),
    amount: z
        .number({ error: 'Amount is required' })
        .positive('Amount must be greater than 0')
        .refine(hasAtMostTwoDecimals, 'Amount can have at most 2 decimals'),
});

// PATCH: use extend to have any field of the invoice, including status, every field optional
export const invoiceUpdateSchema = invoiceSchema.extend({ status: invoiceStatusSchema }).partial();

// Messages pushed by the WebSocket server (server/ws.ts). Kept minimal on purpose:
// they only tell the client what changed, the client refetches the data through the API.
// sourceId = tab that triggered the mutation (see TAB_ID in lib/realtime.ts)
export const invoiceEventSchema = z.object({
    type: z.enum(['invoice.created', 'invoice.updated', 'invoice.deleted']),
    id: z.string(),
    sourceId: z.string().optional(),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
export type InvoiceFormUpdateValues = z.infer<typeof invoiceUpdateSchema>;
