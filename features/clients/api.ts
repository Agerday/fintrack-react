import { apiClient } from '@/lib/api-client';
import type { Client } from './types';

export function getClients() {
    return apiClient<Client[]>('/clients');
}
