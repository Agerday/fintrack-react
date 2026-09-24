import { apiClient } from '@/lib/api-client';
import type { Invoice } from './types';
import { InvoiceFormValues, InvoiceFormUpdateValues } from '@/features/invoices/schema';

export function getInvoices() {
    return apiClient<Invoice[]>('/invoices');
}

export function getInvoice(id: string) {
    return apiClient<Invoice>(`/invoices/${id}`);
}

export function createInvoice(data: InvoiceFormValues) {
    return apiClient<Invoice>('/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}

export function updateInvoice(id: string, data: InvoiceFormUpdateValues) {
    return apiClient<Invoice>(`/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}

export function deleteInvoice(id: string) {
    return apiClient<void>(`/invoices/${id}`, { method: 'DELETE' });
}
