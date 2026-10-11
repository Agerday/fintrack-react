import type { Invoice } from '@/features/invoices/types';
import { sumAmounts } from '@/lib/money';
import type { Account, Transaction } from './types';

// Business rules of the bank account: pure functions, no React / fetch / store (see invoices/rules.ts)

export function balanceOf(transactions: Pick<Transaction, 'amount'>[]): number {
    return sumAmounts(transactions.map(({ amount }) => amount));
}

// One payment per invoice, so its id is derived from the invoice id
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

// Shared by the Route Handler and the MSW handler, so both return the same body.
// ISO dates sort as plain strings
export function toAccount(transactions: Transaction[]): Account {
    return {
        balance: balanceOf(transactions),
        transactions: [...transactions].sort((a, b) => b.date.localeCompare(a.date)),
    };
}
