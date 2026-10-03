import { profile as seedProfile } from '@/features/profile/data';
import type { Profile } from '@/features/profile/types';

export const profileStore = { profile: { ...seedProfile } as Profile };
