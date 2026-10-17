import { useActionState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getProfile } from './api';
import { saveProfile, type SaveProfileState } from './actions';
import type { Profile } from './types';

export function useProfile() {
    return useQuery({ queryKey: ['profile'], queryFn: getProfile });
}

// useActionState over the saveProfile Server Action: returns [state, formAction, isPending].
// The saved profile is written to the TanStack cache, so the header shows the new name at once
export function useSaveProfile(profile: Profile) {
    const queryClient = useQueryClient();

    return useActionState(
        async (previous: SaveProfileState, formData: FormData) => {
            const next = await saveProfile(previous, formData);
            if (next.status === 'success') queryClient.setQueryData(['profile'], next.values);
            return next;
        },
        { status: 'idle', values: profile },
    );
}
