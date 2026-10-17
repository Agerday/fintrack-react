import { apiClient } from '@/lib/api-client';
import type { Profile } from './types';

// Saving goes through the saveProfile Server Action (actions.ts), not this client
export function getProfile() {
    return apiClient<Profile>('/profile');
}
