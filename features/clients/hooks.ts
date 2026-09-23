import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient, getClients } from './api';

export function useClients() {
    return useQuery({ queryKey: ['clients'], queryFn: getClients });
}

export function useCreateClient() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createClient,
        onSuccess: () =>
            void queryClient.invalidateQueries({
                queryKey: ['clients'],
            }),
        onError: (error) => {
            console.error('Failed to create client:', error);
        },
    });
}
