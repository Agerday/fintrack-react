import { startTransition, useEffect, useOptimistic } from 'react';
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import {
    cancelPendingOrder,
    getOrders,
    getPendingOrders,
    getPositions,
    placeOcoOrder,
    placeOrder,
    placePendingOrder,
} from './api';
import { pendingOrderLabels, tradeExecutedNotification, withoutPendingOrder } from './rules';
import { marketMessageSchema } from './schema';
import type { PendingOrder } from './types';
import { useWebSocket } from '@/hooks/useWebSocket';
import { MARKET_WS_URL, parseEvent } from '@/lib/realtime';
import { useMarketStore } from '@/lib/store/useMarketStore';
import { notifyFailure, useNotificationStore } from '@/lib/store/useNotificationStore';

// A fill changes the positions, the history, the pending orders (a stop loss is consumed,
// a sold-out asset loses the others) and the bank account
function refreshPortfolio(queryClient: QueryClient) {
    void queryClient.invalidateQueries({ queryKey: ['positions'] });
    void queryClient.invalidateQueries({ queryKey: ['orders'] });
    void queryClient.invalidateQueries({ queryKey: ['pending-orders'] });
    void queryClient.invalidateQueries({ queryKey: ['account'] });
}

export function usePositions() {
    return useQuery({ queryKey: ['positions'], queryFn: getPositions });
}

export function useOrders() {
    return useQuery({ queryKey: ['orders'], queryFn: getOrders });
}

export function usePendingOrders() {
    return useQuery({ queryKey: ['pending-orders'], queryFn: getPendingOrders });
}

export function usePlaceOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: placeOrder,
        onSuccess: () => refreshPortfolio(queryClient),
        onError: (error) => {
            console.error('Failed to place order:', error);
        },
    });
}

export function usePlacePendingOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: placePendingOrder,
        onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['pending-orders'] }),
        onError: (error) => {
            console.error('Failed to place pending order:', error);
        },
    });
}

export function usePlaceOcoOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: placeOcoOrder,
        onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['pending-orders'] }),
        onError: (error) => {
            console.error('Failed to place OCO order:', error);
        },
    });
}

export function useCancelPendingOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: cancelPendingOrder,
        // Returned, not voided: mutateAsync then resolves once the list is refetched, which
        // useOptimisticCancel waits for before dropping its optimistic copy
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pending-orders'] }),
        onError: (error) => {
            console.error('Failed to cancel pending order:', error);
        },
    });
}

// Cancels with an optimistic update: the order (and its OCO twin) leaves the list at once.
// If the API fails, useOptimistic shows it again and the error goes to the notification bell.
// Same pattern as useOptimisticPayment for invoices
export function useOptimisticCancel(pendingOrders: PendingOrder[]) {
    const [displayed, hide] = useOptimistic(pendingOrders, withoutPendingOrder);
    const { mutateAsync } = useCancelPendingOrder();

    function cancel(pending: PendingOrder) {
        startTransition(async () => {
            hide(pending.id);
            try {
                await mutateAsync(pending.id);
            } catch (error) {
                notifyFailure(
                    `Could not cancel the ${pendingOrderLabels[pending.type].toLowerCase()} on ${pending.symbol}`,
                    error,
                );
            }
        });
    }

    return { pendingOrders: displayed, cancel };
}

// Opens the market socket while the page is mounted and feeds the live prices into
// useMarketStore, plus handles the trades the server filled on its own (stop loss, take profit,
// buy limit). Not TanStack Query: nothing to fetch, the socket is the only source. Mount it
// once per page; components read the prices with useQuote / useMarketPrices
export function useMarketFeed() {
    const queryClient = useQueryClient();

    const status = useWebSocket(MARKET_WS_URL, {
        onReconnect: () => {
            // The server replays its recent history on every connection: start from scratch
            // instead of appending it twice
            useMarketStore.setState({ market: {} });
            // A stop loss may have fired while we were offline
            refreshPortfolio(queryClient);
        },
        onMessage: (data) => {
            const message = parseEvent(data, marketMessageSchema);
            if (!message) {
                console.warn('Ignored invalid market message:', data);
                return;
            }
            // getState(), not a hook: read when the message arrives, outside render
            if (message.type === 'price') {
                useMarketStore.getState().applyTick(message);
                return;
            }
            refreshPortfolio(queryClient);
            useNotificationStore.getState().add(tradeExecutedNotification(message));
        },
    });

    useEffect(() => {
        useMarketStore.getState().setStatus(status);
    }, [status]);

    // Leaving the page closes the socket: the next visit gets a fresh replay
    useEffect(() => () => useMarketStore.getState().reset(), []);
}
