import 'server-only';
import { clientStore } from '@/app/api/clients/store';
import { invoiceStore } from '@/app/api/invoices/store';
import { withInvoiceStats } from './rules';
import type { Client } from './types';

// Server-side reads, shared by GET /api/clients and the prefetching Server Components

// Computed on every read from the current invoices
export function listClients(): Client[] {
    return withInvoiceStats(clientStore.clients, invoiceStore.invoices);
}
