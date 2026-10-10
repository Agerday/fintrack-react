import { apiClient } from '@/lib/api-client';
import type { CompanyFormValues } from './schema';
import type { Company } from './types';

export function getCompany() {
    return apiClient<Company>('/company');
}

// PUT, not PATCH: the form always sends the whole company profile
export function updateCompany(data: CompanyFormValues) {
    return apiClient<Company>('/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}
