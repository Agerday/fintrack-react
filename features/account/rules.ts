import type { Invoice } from '@/features/invoices/types';
import type { Order } from '@/features/trading/types';
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

// A buy takes the money out of the account, a sell puts it back
export function tradeTransaction(order: Order): Transaction {
    const bought = order.side === 'buy';
    return {
        id: `TRX-${order.id}`,
        date: order.date,
        type: 'trade',
        label: `${bought ? 'Bought' : 'Sold'} ${order.quantity} ${order.symbol}`,
        amount: bought ? -order.total : order.total,
    };
}
