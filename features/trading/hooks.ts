import { useState } from 'react';
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import {
    cancelPendingOrder,
    getOrders,
    getPendingOrders,
    getPositions,
    placeOrder,
    placePendingOrder,
} from './api';
import { applyTick, tradeExecutedNotification } from './rules';
import { marketMessageSchema } from './schema';
import type { Market } from './types';
import { useWebSocket } from '@/hooks/useWebSocket';
import { MARKET_WS_URL, parseEvent } from '@/lib/realtime';
import { useNotificationStore } from '@/lib/store/useNotificationStore';

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

export function useCancelPendingOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: cancelPendingOrder,
        onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['pending-orders'] }),
        onError: (error) => {
            console.error('Failed to cancel pending order:', error);
        },
    });
}

// Live prices pushed by the market simulator, plus the trades the server filled on its own
// (stop loss / take profit). Prices are plain component state, not TanStack Query: nothing to
// fetch, the socket is the only source. Not Zustand either: only the pages showing them need
// it, and the connection lives as long as they are mounted
export function useMarket() {
    const queryClient = useQueryClient();
    const [market, setMarket] = useState<Market>({});

    const status = useWebSocket(MARKET_WS_URL, {
        // A stop loss may have fired while we were offline
        onReconnect: () => refreshPortfolio(queryClient),
        onMessage: (data) => {
            const message = parseEvent(data, marketMessageSchema);
            if (!message) {
                console.warn('Ignored invalid market message:', data);
                return;
            }
            if (message.type === 'price') {
                setMarket((current) => applyTick(current, message));
                return;
            }
            refreshPortfolio(queryClient);
            // getState(), not a hook: read when the message arrives, outside render
            useNotificationStore.getState().add(tradeExecutedNotification(message));
        },
    });

    return { market, status };
}
