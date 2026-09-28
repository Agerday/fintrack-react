import type { invoiceEventSchema, invoiceStatusSchema } from '@/features/invoices/schema';
import type { z } from 'zod';

export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>;

export type Invoice = {
    id: string;
    client: string;
    date: string;
    amount: number;
    status: InvoiceStatus;
};

export type InvoiceEvent = z.infer<typeof invoiceEventSchema>;
