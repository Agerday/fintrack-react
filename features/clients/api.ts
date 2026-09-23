import { apiClient } from '@/lib/api-client';
import type { Client } from './types';
import { ClientFormValues } from '@/features/clients/schema';

export function getClients() {
    return apiClient<Client[]>('/clients');
}

export function createClient(data: ClientFormValues) {
    return apiClient<Client>('/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}

export function checkEmailExists(email: string) {
    return apiClient<{ exists: boolean }>(
        `/clients/check-email?email=${encodeURIComponent(email)}`,
    );
}
