import { sharedStore } from '@/lib/shared-store';
import { pendingOrders, positions, orders } from '@/features/trading/data';
import type { Order, PendingOrder, Position } from '@/features/trading/types';

export const tradingStore = sharedStore('trading', () => ({
    positions: [...positions] as Position[],
    // Executed orders, oldest first
    orders: [...orders] as Order[],
    pendingOrders: [...pendingOrders] as PendingOrder[],
}));
