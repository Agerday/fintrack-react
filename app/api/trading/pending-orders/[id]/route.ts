import { NextResponse } from 'next/server';
import { tradingStore } from '@/app/api/trading/store';
import { withoutPendingOrder } from '@/features/trading/rules';
import { findOrThrow } from '@/lib/find-or-throw';
import { withErrorHandling } from '@/lib/with-error-handling';

// Cancelling one leg of an OCO cancels its twin too
export const DELETE = withErrorHandling(
    async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
        const { id } = await params;
        findOrThrow(tradingStore.pendingOrders, id, 'Pending order');

        tradingStore.pendingOrders = withoutPendingOrder(tradingStore.pendingOrders, id);
        return NextResponse.json({ success: true });
    },
);
