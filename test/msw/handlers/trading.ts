import { http, HttpResponse, ws } from 'msw';
import type { z } from 'zod';
import { balanceOf, tradeTransaction } from '@/features/account/rules';
import {
    createPendingOrder,
    executeOrder,
    heldQuantity,
    orderRejection,
    pendingOrderRejection,
} from '@/features/trading/rules';
import { orderSchema, pendingOrderSchema } from '@/features/trading/schema';
import type { Order, PendingOrder, Position, PriceTick } from '@/features/trading/types';
import { MARKET_PRICES_URL, MARKET_WS_URL } from '@/lib/realtime';
import { accountDb } from './account';

// Mirrors app/api/trading and the market simulator of server/ws.ts. Starts empty:
// each test arranges the prices, positions and orders it needs
export const tradingDb = {
    positions: [] as Position[],
    // Oldest first, like the real store: GET returns them reversed
    orders: [] as Order[],
    pendingOrders: [] as PendingOrder[],
    // What the market serves on GET /prices and sends to a newly connected socket
    prices: [] as PriceTick[],
    reset() {
        this.positions = [];
        this.orders = [];
        this.pendingOrders = [];
        this.prices = [];
    },
};

// Tests push live prices and trade events with marketFeed.broadcast(JSON.stringify(...))
export const marketFeed = ws.link(MARKET_WS_URL);

// Same body as parseBody + withErrorHandling
function badRequest(message: string, field: string) {
    return HttpResponse.json({ message, field }, { status: 400 });
}

function validationError(error: z.ZodError) {
    const issue = error.issues[0];
    return badRequest(issue.message, String(issue.path[0]));
}

function priceOf(symbol: string) {
    return tradingDb.prices.find((tick) => tick.symbol === symbol)?.price;
}

export const tradingHandlers = [
    // The market simulator, called by the trading Route Handlers (node tests)
    http.get(MARKET_PRICES_URL, () => HttpResponse.json(tradingDb.prices)),

    http.get('/api/trading/positions', () => HttpResponse.json(tradingDb.positions)),

    http.get('/api/trading/orders', () => HttpResponse.json([...tradingDb.orders].reverse())),

    http.post('/api/trading/orders', async ({ request }) => {
        const result = orderSchema.safeParse(await request.json());
        if (!result.success) return validationError(result.error);

        const price = priceOf(result.data.symbol);
        if (price === undefined) return badRequest('Unknown asset', 'symbol');
        const rejection = orderRejection(
            result.data,
            price,
            balanceOf(accountDb.transactions),
            tradingDb.positions,
        );
        if (rejection) return HttpResponse.json({ message: rejection }, { status: 409 });

        const { order, positions } = executeOrder(
            tradingDb.positions,
            result.data,
            price,
            new Date(),
        );
        tradingDb.positions = positions;
        tradingDb.orders = [...tradingDb.orders, order];
        accountDb.transactions = [...accountDb.transactions, tradeTransaction(order)];
        return HttpResponse.json(order, { status: 201 });
    }),

    http.get('/api/trading/pending-orders', () => HttpResponse.json(tradingDb.pendingOrders)),

    http.post('/api/trading/pending-orders', async ({ request }) => {
        const result = pendingOrderSchema.safeParse(await request.json());
        if (!result.success) return validationError(result.error);

        const price = priceOf(result.data.symbol);
        if (price === undefined) return badRequest('Unknown asset', 'symbol');
        const rejection = pendingOrderRejection(
            result.data,
            price,
            heldQuantity(tradingDb.positions, result.data.symbol),
        );
        if (rejection) return badRequest(rejection.message, rejection.field);

        const pending = createPendingOrder(result.data, new Date());
        tradingDb.pendingOrders = [...tradingDb.pendingOrders, pending];
        return HttpResponse.json(pending, { status: 201 });
    }),

    http.delete('/api/trading/pending-orders/:id', ({ params }) => {
        if (!tradingDb.pendingOrders.some((pending) => pending.id === params.id)) {
            return HttpResponse.json({ message: 'Pending order not found' }, { status: 404 });
        }
        tradingDb.pendingOrders = tradingDb.pendingOrders.filter(
            (pending) => pending.id !== params.id,
        );
        return HttpResponse.json({ success: true });
    }),

    // Like the real server, which replays its recent history: here one point per asset
    marketFeed.addEventListener('connection', ({ client }) => {
        for (const tick of tradingDb.prices) client.send(JSON.stringify(tick));
    }),
];
