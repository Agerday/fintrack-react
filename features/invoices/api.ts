import { apiClient } from '@/lib/api-client';
import type { Invoice } from './types';

export function getInvoices() {
    return apiClient<Invoice[]>('/invoices');
}

export function getInvoice(id: string) {
    return apiClient<Invoice>(`/invoices/${id}`);
}

export function createInvoice(data: Omit<Invoice, 'id'>) {
    return apiClient<Invoice>('/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}

export function updateInvoice(id: string, data: Partial<Invoice>) {
    return apiClient<Invoice>(`/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}

export function deleteInvoice(id: string) {
    return apiClient<void>(`/invoices/${id}`, { method: 'DELETE' });
}
