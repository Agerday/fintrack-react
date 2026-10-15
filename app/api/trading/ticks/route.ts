import { NextResponse } from 'next/server';
import { accountStore } from '@/app/api/account/store';
import { commitOrders } from '@/app/api/trading/commit';
import { tradingStore } from '@/app/api/trading/store';
import { balanceOf } from '@/features/account/rules';
import { fillPendingOrders, tradeExecutedEvent } from '@/features/trading/rules';
import { priceTickSchema } from '@/features/trading/schema';
import { parseBody } from '@/lib/parse-body';
import { publishEvent } from '@/lib/realtime';
import { withErrorHandling } from '@/lib/with-error-handling';

// Called by the market simulator (server/ws.ts) on every tick, not by the browser.
// Fills the pending orders the new price crossed, like a broker's order book
export const POST = withErrorHandling(async (request: Request) => {
    const tick = await parseBody(request, priceTickSchema);

    const { orders, positions, pendingOrders } = fillPendingOrders(
        tradingStore,
        tick,
        new Date(),
        balanceOf(accountStore.transactions),
    );
    tradingStore.pendingOrders = pendingOrders;
    if (orders.length) commitOrders(orders, positions);

    // Every open trading page refreshes its portfolio and tells the user
    for (const order of orders) {
        await publishEvent(request, tradeExecutedEvent(order), 'market');
    }
    return NextResponse.json({ filled: orders.length });
});
