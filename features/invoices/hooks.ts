import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createInvoice, deleteInvoice, getInvoice, getInvoices, updateInvoice } from './api';
import { InvoiceFormUpdateValues } from '@/features/invoices/schema';
import { useEffect } from 'react';
import { WS_URL } from '@/lib/realtime';
import type { InvoiceEvent } from './types';

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
        mutationFn: ({ id, data }: { id: string; data: InvoiceFormUpdateValues }) =>
            updateInvoice(id, data),
        onSuccess: (_data, { id }) => {
            //same here we refresh after updating, the list and the detail page
            void queryClient.invalidateQueries({ queryKey: ['invoices'] });
            void queryClient.invalidateQueries({ queryKey: ['invoice', id] });
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
        onSuccess: (_data, id) => {
            // the invoice no longer exists, drop its cache instead of refetching a 404
            queryClient.removeQueries({ queryKey: ['invoice', id] });
            void queryClient.invalidateQueries({ queryKey: ['invoices'] });
        },
        onError: (error) => {
            console.error('Failed to delete invoice:', error);
        },
    });
}

// Reconnection delays grow 1s, 2s, 4s, 8s... up to this cap
const RECONNECT_MAX_DELAY_MS = 10_000;

// Keeps a WebSocket connection open while the component is mounted and refreshes
// the TanStack Query cache when the server pushes an invoice event.
// Angular equivalent: webSocket() from rxjs/webSocket + retry({ delay }) + takeUntilDestroyed()
export function useInvoiceEvents() {
    const queryClient = useQueryClient();

    useEffect(() => {
        // Mutable state local to this effect run: each mount gets its own connection
        let socket: WebSocket;
        let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
        let attempts = 0;
        // Set by the cleanup, so a close we asked for doesn't trigger a reconnection
        let unmounted = false;

        function connect() {
            // `new WebSocket` starts the handshake: an HTTP request with `Upgrade: websocket`,
            // the server answers 101 Switching Protocols and the TCP connection stays open.
            // Visible in Chrome DevTools > Network > WS > Messages
            socket = new WebSocket(WS_URL);

            // Fires once the handshake succeeded, the socket can now receive (and send) messages
            socket.onopen = () => {
                // Events pushed while we were disconnected are lost (the server keeps no history),
                // so after a REconnection we refetch to catch up
                if (attempts > 0) void queryClient.invalidateQueries({ queryKey: ['invoices'] });
                attempts = 0;
            };

            // Fires for every message pushed by the server. WebSocket only carries text or binary,
            // so structured data travels as JSON and must be parsed by hand
            socket.onmessage = (event: MessageEvent<string>) => {
                const message = JSON.parse(event.data) as InvoiceEvent;

                // The event only says WHAT changed (type + id), not the new data:
                // we invalidate and TanStack Query refetches through the normal API
                void queryClient.invalidateQueries({ queryKey: ['invoices'] });
                if (message.type !== 'invoice.created') {
                    // updated -> the detail page refetches the new values,
                    // deleted -> the refetch gets a 404 and QueryState shows the error
                    void queryClient.invalidateQueries({ queryKey: ['invoice', message.id] });
                }
            };

            // Fires on every disconnection: server stopped, network lost, or our own close().
            // A failed handshake fires onerror then onclose, so reconnecting here covers both
            socket.onclose = () => {
                if (unmounted) return;

                // Exponential backoff: don't hammer a server that is down or restarting
                const delay = Math.min(1000 * 2 ** attempts, RECONNECT_MAX_DELAY_MS);
                attempts++;
                reconnectTimer = setTimeout(connect, delay);
            };
        }

        connect();

        // Cleanup, like ngOnDestroy: without it every mount would leak an open connection.
        // In dev, React Strict Mode mounts -> unmounts -> remounts, so you'll see one connection
        // closed right away (and a "closed before the connection is established" warning): expected
        return () => {
            unmounted = true;
            clearTimeout(reconnectTimer);
            socket.close();
        };
    }, [queryClient]);
}
