import { sharedStore } from '@/lib/shared-store';
import { transactions as seedTransactions } from '@/features/account/data';
import type { Transaction } from '@/features/account/types';

export const accountStore = sharedStore('account', () => ({
    transactions: [...seedTransactions] as Transaction[],
}));
