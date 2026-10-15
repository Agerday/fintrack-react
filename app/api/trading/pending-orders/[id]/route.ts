import { NextResponse } from 'next/server';
import { tradingStore } from '@/app/api/trading/store';
import { findOrThrow } from '@/lib/find-or-throw';
import { withErrorHandling } from '@/lib/with-error-handling';

export const DELETE = withErrorHandling(
    async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
        const { id } = await params;
        findOrThrow(tradingStore.pendingOrders, id, 'Pending order');

        tradingStore.pendingOrders = tradingStore.pendingOrders.filter(
            (pending) => pending.id !== id,
        );
        return NextResponse.json({ success: true });
    },
);
