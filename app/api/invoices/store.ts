import { invoices as seedInvoices } from '@/features/invoices/data';
import type { Invoice } from '@/features/invoices/types';

export const invoiceStore = { invoices: [...seedInvoices] as Invoice[] };
