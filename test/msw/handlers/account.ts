import { http, HttpResponse } from 'msw';
import { toAccount } from '@/features/account/rules';
import type { Transaction } from '@/features/account/types';

// Mirrors app/api/account. Starts empty: each test arranges the transactions it needs.
// The invoices handler credits it when an invoice is paid, like the real PATCH route
export const accountDb = {
    transactions: [] as Transaction[],
    reset() {
        this.transactions = [];
    },
};

export const accountHandlers = [
    http.get('/api/account', () => HttpResponse.json(toAccount(accountDb.transactions))),
];
