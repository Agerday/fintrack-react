import { groupByClient } from '@/features/clients/rules';
import { invoiceStatuses } from '@/features/invoices/schema';
import type { Invoice, InvoiceStatus } from '@/features/invoices/types';
import { sumAmounts } from '@/lib/money';

// Business rules of the dashboard: pure functions, no React / fetch / store (see invoices/rules.ts)

export type AmountByStatus = { status: InvoiceStatus; total: number }[];

// Every status is always present (0 when no invoice has it), in the schema order,
// so the chart keeps the same bars and colors whatever the data
export function sumAmountByStatus(invoices: Pick<Invoice, 'amount' | 'status'>[]): AmountByStatus {
    return invoiceStatuses.map((status) => ({
        status,
        total: sumAmounts(
            invoices.filter((invoice) => invoice.status === status).map(({ amount }) => amount),
        ),
    }));
}

// Share of the invoiced amount already paid, from 0 to 1. 0 when nothing is invoiced
// (not NaN from 0 / 0, which would break the gauge)
export function collectionRate(amountByStatus: AmountByStatus): number {
    const invoiced = sumAmounts(amountByStatus.map(({ total }) => total));
    const paid = amountByStatus.find(({ status }) => status === 'paid')?.total ?? 0;
    return invoiced === 0 ? 0 : paid / invoiced;
}

export type AmountByClient = { client: string; total: number }[];

// Biggest clients first, capped so the chart stays readable with many clients.
// Grouped like the clients page, so a client is one bar here and one row there
export function sumAmountByClient(
    invoices: Pick<Invoice, 'amount' | 'client'>[],
    limit = 5,
): AmountByClient {
    return [...groupByClient(invoices).values()]
        .map(({ name, amounts }) => ({ client: name, total: sumAmounts(amounts) }))
        .sort((a, b) => b.total - a.total)
        .slice(0, limit);
}
