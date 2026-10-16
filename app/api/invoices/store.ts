import { sharedStore } from '@/lib/shared-store';
import { invoices as seedInvoices } from '@/features/invoices/data';
import type { Invoice } from '@/features/invoices/types';

export const invoiceStore = sharedStore('invoices', () => ({
    invoices: [...seedInvoices] as Invoice[],
}));
