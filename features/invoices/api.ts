import { apiClient } from '@/lib/api-client';
import type { Invoice } from './types';

export function getInvoices() {
    return apiClient<Invoice[]>('/invoices');
}
