import 'server-only';
import { invoiceStore } from '@/app/api/invoices/store';
import { findOrThrow } from '@/lib/find-or-throw';
import type { Invoice } from './types';

// Server-side reads, shared by the Route Handlers (GET) and the Server Components that prefetch
// the page data: both answer with exactly the same shape. Like a Spring @Service the
// @RestController and the server-rendered views both call. 'server-only' breaks the build if a
// Client Component ever imports this file

export function listInvoices(): Invoice[] {
    return invoiceStore.invoices;
}

export function findInvoice(id: string): Invoice {
    return findOrThrow(invoiceStore.invoices, id, 'Invoice');
}
