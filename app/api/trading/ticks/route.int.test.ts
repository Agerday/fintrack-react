// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { POST } from './route';
import { accountStore } from '@/app/api/account/store';
import { tradingStore } from '@/app/api/trading/store';
import { balanceOf } from '@/features/account/rules';
import { publishEvent } from '@/lib/realtime';
import {
    buildPendingOrder,
    buildPosition,
    buildPriceTick,
    buildTransaction,
} from '@/test/factories';

// Leaves the process (POST to the socket server): a real boundary
vi.mock('@/lib/realtime', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@/lib/realtime')>()),
    publishEvent: vi.fn(),
}));

function postTick(price: number) {
    return POST(
        new Request('http://localhost/api/trading/ticks', {
            method: 'POST',
            body: JSON.stringify(buildPriceTick({ symbol: 'AAPL', price })),
        }),
    );
}

function arrangeStopLoss() {
    accountStore.transactions = [buildTransaction({ amount: 0 })];
    tradingStore.positions = [buildPosition({ symbol: 'AAPL', quantity: 3, averagePrice: 100 })];
    tradingStore.orders = [];
    tradingStore.pendingOrders = [
        buildPendingOrder({ symbol: 'AAPL', type: 'stop_loss', quantity: 2, triggerPrice: 95 }),
    ];
}

describe('POST /api/trading/ticks', () => {
    it('fills a crossed stop loss: sells, credits the account and records the order', async () => {
        arrangeStopLoss();

        await postTick(94);

        expect(tradingStore.positions[0]).toMatchObject({ quantity: 1, realizedPnl: -12 });
        expect(balanceOf(accountStore.transactions)).toBe(188);
        expect(tradingStore.orders).toEqual([
            expect.objectContaining({ side: 'sell', quantity: 2, trigger: 'stop_loss' }),
        ]);
        expect(tradingStore.pendingOrders).toEqual([]);
    });

    it('tells the open trading pages that a stop loss was filled', async () => {
        arrangeStopLoss();
        const request = new Request('http://localhost/api/trading/ticks', {
            method: 'POST',
            body: JSON.stringify(buildPriceTick({ symbol: 'AAPL', price: 94 })),
        });

        await POST(request);

        expect(publishEvent).toHaveBeenCalledWith(
            request,
            {
                type: 'trade.executed',
                trigger: 'stop_loss',
                symbol: 'AAPL',
                quantity: 2,
                price: 94,
            },
            'market',
        );
    });

    it('does nothing while the price stays above the stop loss', async () => {
        arrangeStopLoss();

        await postTick(95.01);

        expect(tradingStore.pendingOrders).toHaveLength(1);
        expect(tradingStore.orders).toEqual([]);
        expect(publishEvent).not.toHaveBeenCalled();
    });
});
