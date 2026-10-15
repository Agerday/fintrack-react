import { NextResponse } from 'next/server';
import { accountStore } from '@/app/api/account/store';
import { commitOrders } from '@/app/api/trading/commit';
import { marketPrice } from '@/app/api/trading/market';
import { tradingStore } from '@/app/api/trading/store';
import { balanceOf } from '@/features/account/rules';
import { availableCash, executeOrder, orderRejection } from '@/features/trading/rules';
import { orderSchema } from '@/features/trading/schema';
import { HttpError } from '@/lib/http-error';
import { parseBody } from '@/lib/parse-body';
import { withErrorHandling } from '@/lib/with-error-handling';

// Order history, newest first
export async function GET() {
    return NextResponse.json([...tradingStore.orders].reverse());
}

// Market order: filled at once at the live price, paid from (or credited to) the bank account.
// A buy can't touch the cash the buy limits reserved
export const POST = withErrorHandling(async (request: Request) => {
    const data = await parseBody(request, orderSchema);
    const price = await marketPrice(data.symbol);

    const rejection = orderRejection(
        data,
        price,
        availableCash(balanceOf(accountStore.transactions), tradingStore.pendingOrders),
        tradingStore.positions,
    );
    if (rejection) throw new HttpError(409, rejection);

    const { order, positions } = executeOrder(tradingStore.positions, data, price, new Date());
    commitOrders([order], positions);

    return NextResponse.json(order, { status: 201 });
});
