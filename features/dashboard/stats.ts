import { invoiceStatuses } from '@/features/invoices/schema';
import type { Invoice, InvoiceStatus } from '@/features/invoices/types';

export type AmountByStatus = { status: InvoiceStatus; total: number }[];

// Every status is always present (0 when no invoice has it), in the schema order,
// so the chart keeps the same bars and colors whatever the data
export function sumAmountByStatus(invoices: Pick<Invoice, 'amount' | 'status'>[]): AmountByStatus {
    return invoiceStatuses.map((status) => ({
        status,
        total: invoices
            .filter((invoice) => invoice.status === status)
            .reduce((sum, invoice) => sum + invoice.amount, 0),
    }));
}
