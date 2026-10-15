import { apiClient } from '@/lib/api-client';
import type { OcoOrderFormValues, OrderFormValues, PendingOrderFormValues } from './schema';
import type { Order, PendingOrder, Position } from './types';

export function getPositions() {
    return apiClient<Position[]>('/trading/positions');
}

export function getOrders() {
    return apiClient<Order[]>('/trading/orders');
}

export function placeOrder(data: OrderFormValues) {
    return apiClient<Order>('/trading/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}

export function getPendingOrders() {
    return apiClient<PendingOrder[]>('/trading/pending-orders');
}

export function placePendingOrder(data: PendingOrderFormValues) {
    return apiClient<PendingOrder>('/trading/pending-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}

// Returns the two linked legs: stop loss first, take profit second
export function placeOcoOrder(data: OcoOrderFormValues) {
    return apiClient<PendingOrder[]>('/trading/pending-orders/oco', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}

export function cancelPendingOrder(id: string) {
    return apiClient<void>(`/trading/pending-orders/${id}`, { method: 'DELETE' });
}
