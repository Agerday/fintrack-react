import { NextResponse } from 'next/server';
import { marketPrice } from '@/app/api/trading/market';
import { tradingStore } from '@/app/api/trading/store';
import { createPendingOrder, heldQuantity, pendingOrderRejection } from '@/features/trading/rules';
import { pendingOrderSchema } from '@/features/trading/schema';
import { HttpError } from '@/lib/http-error';
import { parseBody } from '@/lib/parse-body';
import { withErrorHandling } from '@/lib/with-error-handling';

export async function GET() {
    return NextResponse.json(tradingStore.pendingOrders);
}

// Places a stop loss or take profit. It is filled later, by POST /api/trading/ticks
export const POST = withErrorHandling(async (request: Request) => {
    const data = await parseBody(request, pendingOrderSchema);
    const price = await marketPrice(data.symbol);

    const rejection = pendingOrderRejection(
        data,
        price,
        heldQuantity(tradingStore.positions, data.symbol),
    );
    // 400 with the field: the form shows the message under the quantity or the trigger price
    if (rejection) throw new HttpError(400, rejection.message, rejection.field);

    const pending = createPendingOrder(data, new Date());
    tradingStore.pendingOrders = [...tradingStore.pendingOrders, pending];
    return NextResponse.json(pending, { status: 201 });
});
