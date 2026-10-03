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

// Share of the invoiced amount already paid, from 0 to 1. 0 when nothing is invoiced
// (not NaN from 0 / 0, which would break the gauge)
export function collectionRate(amountByStatus: AmountByStatus): number {
    const invoiced = amountByStatus.reduce((sum, { total }) => sum + total, 0);
    const paid = amountByStatus.find(({ status }) => status === 'paid')?.total ?? 0;
    return invoiced === 0 ? 0 : paid / invoiced;
}

export type AmountByClient = { client: string; total: number }[];

// Biggest clients first, capped so the chart stays readable with many clients
export function sumAmountByClient(
    invoices: Pick<Invoice, 'amount' | 'client'>[],
    limit = 5,
): AmountByClient {
    const totals = new Map<string, number>();
    for (const { client, amount } of invoices) {
        totals.set(client, (totals.get(client) ?? 0) + amount);
    }
    return [...totals]
        .map(([client, total]) => ({ client, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, limit);
}
