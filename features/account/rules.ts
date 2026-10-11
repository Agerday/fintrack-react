import type { Invoice } from '@/features/invoices/types';
import { sumAmounts } from '@/lib/money';
import type { Account, Transaction } from './types';

export function balanceOf(transactions: Pick<Transaction, 'amount'>[]): number {
    return sumAmounts(transactions.map(({ amount }) => amount));
}

export function paymentTransaction(
    invoice: Pick<Invoice, 'id' | 'client' | 'amount'>,
    now: Date,
): Transaction {
    return {
        id: `TRX-${invoice.id}`,
        date: now.toISOString(),
        type: 'invoice_payment',
        label: `Payment from ${invoice.client}`,
        amount: invoice.amount,
        invoiceId: invoice.id,
    };
}

export function toAccount(transactions: Transaction[]): Account {
    return {
        balance: balanceOf(transactions),
        transactions: [...transactions].sort((a, b) => b.date.localeCompare(a.date)),
    };
}
