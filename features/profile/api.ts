import { apiClient } from '@/lib/api-client';
import type { ProfileFormValues } from './schema';
import type { Profile } from './types';

export function getProfile() {
    return apiClient<Profile>('/profile');
}

// PUT, not PATCH: the form always sends the whole profile
export function updateProfile(data: ProfileFormValues) {
    return apiClient<Profile>('/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}
