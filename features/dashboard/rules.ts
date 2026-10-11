import { groupByClient } from '@/features/clients/rules';
import { invoiceStatuses } from '@/features/invoices/schema';
import type { Invoice, InvoiceStatus } from '@/features/invoices/types';
import { sumAmounts } from '@/lib/money';

export type AmountByStatus = { status: InvoiceStatus; total: number }[];

export function sumAmountByStatus(invoices: Pick<Invoice, 'amount' | 'status'>[]): AmountByStatus {
    return invoiceStatuses.map((status) => ({
        status,
        total: sumAmounts(
            invoices.filter((invoice) => invoice.status === status).map(({ amount }) => amount),
        ),
    }));
}

export function collectionRate(amountByStatus: AmountByStatus): number {
    const invoiced = sumAmounts(amountByStatus.map(({ total }) => total));
    const paid = amountByStatus.find(({ status }) => status === 'paid')?.total ?? 0;
    return invoiced === 0 ? 0 : paid / invoiced;
}

export type AmountByClient = { client: string; total: number }[];

export function sumAmountByClient(
    invoices: Pick<Invoice, 'amount' | 'client'>[],
    limit = 5,
): AmountByClient {
    return [...groupByClient(invoices).values()]
        .map(({ name, amounts }) => ({ client: name, total: sumAmounts(amounts) }))
        .sort((a, b) => b.total - a.total)
        .slice(0, limit);
}
