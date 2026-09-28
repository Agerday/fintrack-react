import { z } from 'zod';

export const invoiceStatuses = ['paid', 'pending', 'overdue'] as const;
export const invoiceStatusSchema = z.enum(invoiceStatuses);

export const invoiceSchema = z.object({
    client: z.string().trim().min(1, 'Client is required'),
    amount: z.number({ error: 'Amount is required' }).positive('Amount must be greater than 0'),
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
