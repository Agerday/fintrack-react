import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile } from './api';

export function useProfile() {
    return useQuery({ queryKey: ['profile'], queryFn: getProfile });
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateProfile,
        // The response is the full saved profile: write it to the cache instead of refetching,
        // so the header shows the new name at once
        onSuccess: (profile) => {
            queryClient.setQueryData(['profile'], profile);
        },
        onError: (error) => {
            console.error('Failed to update profile:', error);
        },
    });
}
