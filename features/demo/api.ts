import { apiClient } from '@/lib/api-client';

export function resetDemoData() {
    return apiClient<{ success: boolean }>('/demo/reset', { method: 'POST' });
}
