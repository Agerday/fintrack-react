import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createInvoice, getInvoices } from './api';

export function useInvoices() {
    return useQuery({ queryKey: ['invoices'], queryFn: getInvoices }); //Here is only reading
}

export function useCreateInvoice() {
    const queryClient = useQueryClient();
    //Use the queryClient when writing because we need to access the cache
    // to invalidate the invoices query

    return useMutation({
        mutationFn: createInvoice,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['invoices'] }); //refresh the cache
            // void Ignore promise because we don't need to wait for the response'
        },
        onError: (error) => {
            console.error('Failed to create invoice:', error);
        },
    });
}
