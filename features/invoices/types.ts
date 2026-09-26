import type { invoiceStatusSchema } from '@/features/invoices/schema';
import type { z } from 'zod';

export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>;

export type Invoice = {
    id: string;
    client: string;
    date: string;
    amount: number;
    status: InvoiceStatus;
};

// Messages pushed by the WebSocket server (server/ws.ts). Kept minimal on purpose:
// they only tell the client what changed, the client refetches the data through the API
export type InvoiceEvent = {
    type: 'invoice.created' | 'invoice.updated' | 'invoice.deleted';
    id: string;
};
