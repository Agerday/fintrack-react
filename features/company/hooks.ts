import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCompany, updateCompany } from './api';

export function useCompany() {
    return useQuery({ queryKey: ['company'], queryFn: getCompany });
}

export function useUpdateCompany() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateCompany,
        // The response is the full saved company: write it to the cache instead of refetching
        onSuccess: (company) => {
            queryClient.setQueryData(['company'], company);
        },
        onError: (error) => {
            console.error('Failed to update company:', error);
        },
    });
}
