import { z } from 'zod';

export const invoiceStatuses = ['paid', 'pending', 'overdue'] as const;
export const invoiceStatusSchema = z.enum(invoiceStatuses);

export const invoiceSchema = z.object({
    client: z.string().trim().min(1, 'Client is required'),
    amount: z.number().positive('Amount must be greater than 0'),
    date: z.iso.datetime(),
    status: invoiceStatusSchema,
});

export const invoiceUpdateSchema = invoiceSchema.partial();

export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type InvoiceUpdateInput = z.infer<typeof invoiceUpdateSchema>;
