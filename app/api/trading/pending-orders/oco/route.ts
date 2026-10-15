import { NextResponse } from 'next/server';
import { marketPrice } from '@/app/api/trading/market';
import { tradingStore } from '@/app/api/trading/store';
import { createOcoOrders, heldQuantity, ocoRejection } from '@/features/trading/rules';
import { ocoOrderSchema } from '@/features/trading/schema';
import { HttpError } from '@/lib/http-error';
import { parseBody } from '@/lib/parse-body';
import { withErrorHandling } from '@/lib/with-error-handling';

// Places a linked stop loss + take profit. Returns both legs; the first to fire cancels the other
export const POST = withErrorHandling(async (request: Request) => {
    const data = await parseBody(request, ocoOrderSchema);
    const price = await marketPrice(data.symbol);

    const rejection = ocoRejection(data, price, heldQuantity(tradingStore.positions, data.symbol));
    if (rejection) throw new HttpError(400, rejection.message, rejection.field);

    const legs = createOcoOrders(data, new Date());
    tradingStore.pendingOrders = [...tradingStore.pendingOrders, ...legs];
    return NextResponse.json(legs, { status: 201 });
});
