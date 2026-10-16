import { startTransition, useOptimistic } from 'react';
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { createInvoice, deleteInvoice, getInvoice, getInvoices, updateInvoice } from './api';
import { type InvoiceFormUpdateValues, invoiceEventSchema } from '@/features/invoices/schema';
import type { Invoice } from '@/features/invoices/types';
import { parseEvent, TAB_ID, WS_URL } from '@/lib/realtime';
import { invoiceEventNotification } from '@/features/notifications/rules';
import { notifyFailure, useNotificationStore } from '@/lib/store/useNotificationStore';
import { useNotificationPreferencesStore } from '@/lib/store/useNotificationPreferencesStore';
import { useWebSocket } from '@/hooks/useWebSocket';

// Returns the refetch, for callers that must wait for fresh lists (useUpdateInvoice)
function refreshInvoiceLists(queryClient: QueryClient) {
    return Promise.all([
        queryClient.invalidateQueries({ queryKey: ['invoices'] }),
        queryClient.invalidateQueries({ queryKey: ['clients'] }),
    ]);
}

export function useInvoices() {
    return useQuery({ queryKey: ['invoices'], queryFn: getInvoices });
}

export function useInvoice(id: string) {
    return useQuery({
        queryKey: ['invoice', id],
        queryFn: () => getInvoice(id),
    });
}

export function useCreateInvoice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createInvoice,
        onSuccess: () => void refreshInvoiceLists(queryClient),
        onError: (error) => {
            console.error('Failed to create invoice:', error);
        },
    });
}

export function useUpdateInvoice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: InvoiceFormUpdateValues }) =>
            updateInvoice(id, data),
        // Returned, not voided: mutateAsync then resolves once the lists hold the new status,
        // which useOptimisticPayment waits for before dropping its optimistic copy
        onSuccess: (_data, { id }) =>
            Promise.all([
                refreshInvoiceLists(queryClient),
                queryClient.invalidateQueries({ queryKey: ['invoice', id] }),
                // Paying an invoice credits the bank account
                queryClient.invalidateQueries({ queryKey: ['account'] }),
            ]),
        onError: (error) => {
            console.error('Failed to update invoice:', error);
        },
    });
}

// "Mark as paid" with an optimistic update: the invoices passed in come back with the clicked one
// already paid, before the API answers. React 19's useOptimistic keeps that copy only while the
// action runs: on success the refetched list takes over, on failure the real status shows again
// and the error goes to the notification bell. Pass the list of a table, or [invoice] on a page
export function useOptimisticPayment(invoices: Invoice[]) {
    const [displayed, showAsPaid] = useOptimistic(invoices, (current, id: string) =>
        current.map((invoice) =>
            invoice.id === id ? { ...invoice, status: 'paid' as const } : invoice,
        ),
    );
    const { mutateAsync } = useUpdateInvoice();

    function markAsPaid(id: string) {
        // An async transition = a React 19 Action: the optimistic copy lives until it settles
        startTransition(async () => {
            showAsPaid(id);
            try {
                await mutateAsync({ id, data: { status: 'paid' } });
            } catch (error) {
                notifyFailure(`Could not mark ${id} as paid`, error);
            }
        });
    }

    return { invoices: displayed, markAsPaid };
}

export function useDeleteInvoice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteInvoice(id),
        onSuccess: (_data, id) => {
            // the invoice no longer exists, drop its cache instead of refetching a 404
            queryClient.removeQueries({ queryKey: ['invoice', id] });
            void refreshInvoiceLists(queryClient);
        },
        onError: (error) => {
            console.error('Failed to delete invoice:', error);
        },
    });
}

// Refreshes the TanStack Query cache when the server pushes an invoice event.
// The connection itself (open, reconnect, cleanup) is handled by useWebSocket. Returns its
// status, for a "Live" badge
export function useInvoiceEvents() {
    const queryClient = useQueryClient();

    return useWebSocket(WS_URL, {
        // Events pushed while we were disconnected are lost (the server keeps no history),
        // so after a REconnection we refetch to catch up
        onReconnect: () => void refreshInvoiceLists(queryClient),
        onMessage: (data) => {
            const message = parseEvent(data, invoiceEventSchema);
            if (!message) {
                console.warn('Ignored invalid invoice event:', data);
                return;
            }
            // Echo of this tab's own mutation: its onSuccess already refreshed the cache
            if (message.sourceId === TAB_ID) return;

            // getState(), not a hook: read when the message arrives, outside render
            const notification = invoiceEventNotification(
                message,
                useNotificationPreferencesStore.getState().preferences,
            );
            if (notification) useNotificationStore.getState().add(notification);

            // The event only says WHAT changed (type + id), not the new data:
            // we invalidate and TanStack Query refetches through the normal API
            void refreshInvoiceLists(queryClient);
            if (message.type !== 'invoice.created') {
                // updated -> the detail page refetches the new values,
                // deleted -> the refetch gets a 404 and QueryState shows the error
                void queryClient.invalidateQueries({ queryKey: ['invoice', message.id] });
            }
            // Another tab may have paid this invoice, which credits the bank account
            if (message.type === 'invoice.updated') {
                void queryClient.invalidateQueries({ queryKey: ['account'] });
            }
        },
    });
}
