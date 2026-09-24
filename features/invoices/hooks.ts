import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createInvoice, deleteInvoice, getInvoice, getInvoices, updateInvoice } from './api';
import { Invoice } from '@/features/invoices/types';

export function useInvoices() {
    //Here is only reading (useQuery)
    return useQuery({ queryKey: ['invoices'], queryFn: getInvoices });
}

export function useInvoice(id: string) {
    return useQuery({
        queryKey: ['invoice', id],
        queryFn: () => getInvoice(id),
    });
}

export function useCreateInvoice() {
    //Use the queryClient when writing because we need to access the cache
    // to invalidate the invoices query
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createInvoice,
        onSuccess: () => {
            //refresh the cache
            // void Ignore promise because we don't need to wait for the response'
            void queryClient.invalidateQueries({ queryKey: ['invoices'] });
        },
        onError: (error) => {
            console.error('Failed to create invoice:', error);
        },
    });
}

export function useUpdateInvoice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Invoice> }) =>
            updateInvoice(id, data),
        onSuccess: () => {
            //same here we refresh after deleting
            void queryClient.invalidateQueries({ queryKey: ['invoices'] });
        },
        onError: (error) => {
            console.error('Failed to update invoice:', error);
        },
    });
}

export function useDeleteInvoice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteInvoice(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['invoices'] });
        },
        onError: (error) => {
            console.error('Failed to delete invoice:', error);
        },
    });
}
