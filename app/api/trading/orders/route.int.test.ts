// @vitest-environment node
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { GET, POST } from './route';
import { accountStore } from '@/app/api/account/store';
import { tradingStore } from '@/app/api/trading/store';
import { balanceOf } from '@/features/account/rules';
import type { Order } from '@/features/trading/types';
import { MARKET_PRICES_URL } from '@/lib/realtime';
import { buildPosition, buildPriceTick, buildTransaction } from '@/test/factories';
import { server } from '@/test/msw/server';
import { tradingDb } from '@/test/msw/handlers/trading';

function postOrder(body: unknown) {
    return POST(
        new Request('http://localhost/api/trading/orders', {
            method: 'POST',
            body: JSON.stringify(body),
        }),
    );
}

function arrange({ cash = 1000, aaplPrice = 100 } = {}) {
    accountStore.transactions = [buildTransaction({ amount: cash })];
    tradingStore.positions = [];
    tradingStore.orders = [];
    tradingDb.prices = [buildPriceTick({ symbol: 'AAPL', price: aaplPrice })];
}

describe('POST /api/trading/orders', () => {
    it('fills a buy at the live market price and pays it from the bank account', async () => {
        arrange({ cash: 1000, aaplPrice: 123.45 });

        const response = await postOrder({ symbol: 'AAPL', side: 'buy', quantity: 2 });

        expect(response.status).toBe(201);
        expect(await response.json()).toMatchObject({ price: 123.45, total: 246.9 });
        expect(tradingStore.positions).toEqual([
            expect.objectContaining({ symbol: 'AAPL', quantity: 2, averagePrice: 123.45 }),
        ]);
        expect(balanceOf(accountStore.transactions)).toBe(753.1);
    });

    it('credits the bank account when selling', async () => {
        arrange({ cash: 0, aaplPrice: 150 });
        tradingStore.positions = [buildPosition({ symbol: 'AAPL', quantity: 3 })];

        await postOrder({ symbol: 'AAPL', side: 'sell', quantity: 1 });

        expect(balanceOf(accountStore.transactions)).toBe(150);
        expect(tradingStore.positions).toEqual([expect.objectContaining({ quantity: 2 })]);
    });

    it('refuses a buy the cash cannot cover and changes nothing', async () => {
        arrange({ cash: 100, aaplPrice: 100 });

        const response = await postOrder({ symbol: 'AAPL', side: 'buy', quantity: 2 });

        expect(response.status).toBe(409);
        expect(await response.json()).toMatchObject({
            message: 'Insufficient funds: this order costs $200.00, you have $100.00',
        });
        expect(tradingStore.positions).toEqual([]);
        expect(balanceOf(accountStore.transactions)).toBe(100);
    });

    it('refuses to sell an asset the user does not hold', async () => {
        arrange();

        const response = await postOrder({ symbol: 'AAPL', side: 'sell', quantity: 1 });

        expect(response.status).toBe(409);
        expect(await response.json()).toMatchObject({ message: 'You only hold 0 AAPL' });
    });

    it('rejects an asset the market does not list', async () => {
        arrange();

        const response = await postOrder({ symbol: 'NOPE', side: 'buy', quantity: 1 });

        expect(response.status).toBe(400);
        expect(await response.json()).toMatchObject({ field: 'symbol' });
    });

    it('answers 503 when the market simulator is down', async () => {
        arrange();
        server.use(http.get(MARKET_PRICES_URL, () => HttpResponse.error()));

        const response = await postOrder({ symbol: 'AAPL', side: 'buy', quantity: 1 });

        expect(response.status).toBe(503);
        expect(tradingStore.positions).toEqual([]);
    });
});

describe('GET /api/trading/orders', () => {
    it('lists the filled orders newest first', async () => {
        arrange();
        await postOrder({ symbol: 'AAPL', side: 'buy', quantity: 2 });
        await postOrder({ symbol: 'AAPL', side: 'sell', quantity: 1 });

        const response = await GET();

        expect((await response.json()).map(({ side }: Order) => side)).toEqual(['sell', 'buy']);
    });
});
