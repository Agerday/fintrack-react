import { transactions as seedTransactions } from '@/features/account/data';
import type { Transaction } from '@/features/account/types';

export const accountStore = { transactions: [...seedTransactions] as Transaction[] };
