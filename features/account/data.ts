import { invoices } from '@/features/invoices/data';
import { paymentTransaction } from './rules';
import type { Transaction } from './types';

// Derived from the seed invoices, so the starting balance matches the invoices already paid
export const transactions: Transaction[] = invoices
    .filter((invoice) => invoice.status === 'paid')
    .map((invoice) => paymentTransaction(invoice, new Date(invoice.date)));
