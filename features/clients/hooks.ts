import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { checkEmailExists, createClient, getClients } from './api';

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

export function useCheckEmail(email: string) {
    return useQuery({
        queryKey: ['check-email', email],
        queryFn: () => checkEmailExists(email),
        enabled: !!email && email.includes('@') && email.includes('.'),
    });
}
