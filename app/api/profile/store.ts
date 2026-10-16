import { sharedStore } from '@/lib/shared-store';
import { profile as seedProfile } from '@/features/profile/data';
import type { Profile } from '@/features/profile/types';

export const profileStore = sharedStore('profile', () => ({
    profile: { ...seedProfile } as Profile,
}));
