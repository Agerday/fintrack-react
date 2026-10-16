import 'server-only';
import { accountStore } from '@/app/api/account/store';
import { toAccount } from './rules';
import type { Account } from './types';

// Server-side reads, shared by GET /api/account and the prefetching Server Components

export function readAccount(): Account {
    return toAccount(accountStore.transactions);
}
