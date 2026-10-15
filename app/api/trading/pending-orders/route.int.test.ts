// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { POST } from './route';
import { DELETE } from './[id]/route';
import { accountStore } from '@/app/api/account/store';
import { tradingStore } from '@/app/api/trading/store';
import {
    buildPendingOrder,
    buildPosition,
    buildPriceTick,
    buildTransaction,
} from '@/test/factories';
import { tradingDb } from '@/test/msw/handlers/trading';

function postPendingOrder(body: unknown) {
    return POST(
        new Request('http://localhost/api/trading/pending-orders', {
            method: 'POST',
            body: JSON.stringify(body),
        }),
    );
}

function arrange({ held = 2, price = 100 } = {}) {
    tradingStore.positions = [buildPosition({ symbol: 'AAPL', quantity: held })];
    tradingStore.pendingOrders = [];
    tradingDb.prices = [buildPriceTick({ symbol: 'AAPL', price })];
}

describe('POST /api/trading/pending-orders', () => {
    it('places a stop loss below the live price', async () => {
        arrange({ held: 2, price: 100 });

        const response = await postPendingOrder({
            symbol: 'AAPL',
            type: 'stop_loss',
            quantity: 2,
            triggerPrice: 95,
        });

        expect(response.status).toBe(201);
        expect(tradingStore.pendingOrders).toEqual([
            expect.objectContaining({ type: 'stop_loss', quantity: 2, triggerPrice: 95 }),
        ]);
    });

    it('blames the trigger price when the stop loss would fire at once', async () => {
        arrange({ price: 100 });

        const response = await postPendingOrder({
            symbol: 'AAPL',
            type: 'stop_loss',
            quantity: 1,
            triggerPrice: 101,
        });

        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({
            field: 'triggerPrice',
            message: 'A stop loss must be below the current price ($100.00)',
        });
        expect(tradingStore.pendingOrders).toEqual([]);
    });

    it('blames the quantity when it is more than the user holds', async () => {
        arrange({ held: 1 });

        const response = await postPendingOrder({
            symbol: 'AAPL',
            type: 'take_profit',
            quantity: 2,
            triggerPrice: 120,
        });

        expect(response.status).toBe(400);
        expect(await response.json()).toMatchObject({ field: 'quantity' });
    });

    it('places a buy limit the available cash can reserve, without holding the asset', async () => {
        arrange({ held: 0, price: 100 });
        accountStore.transactions = [buildTransaction({ amount: 1000 })];

        const response = await postPendingOrder({
            symbol: 'AAPL',
            type: 'buy_limit',
            quantity: 5,
            triggerPrice: 90,
        });

        expect(response.status).toBe(201);
        expect(tradingStore.pendingOrders).toEqual([
            expect.objectContaining({ type: 'buy_limit', quantity: 5, triggerPrice: 90 }),
        ]);
    });

    it('refuses a buy limit when earlier buy limits already reserved the cash', async () => {
        arrange({ held: 0, price: 100 });
        accountStore.transactions = [buildTransaction({ amount: 1000 })];
        tradingStore.pendingOrders = [
            buildPendingOrder({ type: 'buy_limit', quantity: 10, triggerPrice: 90 }),
        ];

        const response = await postPendingOrder({
            symbol: 'AAPL',
            type: 'buy_limit',
            quantity: 2,
            triggerPrice: 90,
        });

        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({
            field: 'quantity',
            message: 'Insufficient funds: this order reserves $180.00, you have $100.00 available',
        });
    });
});

describe('DELETE /api/trading/pending-orders/[id]', () => {
    it('cancels the pending order', async () => {
        const pending = buildPendingOrder();
        tradingStore.pendingOrders = [pending];

        const response = await DELETE(new Request('http://localhost'), {
            params: Promise.resolve({ id: pending.id }),
        });

        expect(response.status).toBe(200);
        expect(tradingStore.pendingOrders).toEqual([]);
    });

    it('answers 404 for an unknown pending order', async () => {
        tradingStore.pendingOrders = [];

        const response = await DELETE(new Request('http://localhost'), {
            params: Promise.resolve({ id: 'PND-404' }),
        });

        expect(response.status).toBe(404);
    });
});
