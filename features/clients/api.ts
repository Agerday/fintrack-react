import { apiClient } from '@/lib/api-client';
import type { Client } from './types';

export function getClients() {
    return apiClient<Client[]>('/clients');
}

export function createClient(data: Omit<Client, 'id'>) {
    return apiClient<Client>('/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}
