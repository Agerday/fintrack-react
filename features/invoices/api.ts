import { apiClient } from '@/lib/api-client';
import type { Invoice } from './types';

export function getInvoices() {
    return apiClient<Invoice[]>('/invoices');
}

export function createInvoice(data: Omit<Invoice, 'id'>) {
    return apiClient<Invoice>('/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}
