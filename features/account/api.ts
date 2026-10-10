import { apiClient } from '@/lib/api-client';
import type { Account } from './types';

export function getAccount() {
    return apiClient<Account>('/account');
}
