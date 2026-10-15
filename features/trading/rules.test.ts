import { describe, expect, it, vi } from 'vitest';
import {
    applyTick,
    availableCash,
    executeOrder,
    fillPendingOrders,
    MAX_TICK_DELAY_MS,
    MIN_TICK_DELAY_MS,
    nextPrice,
    nextTickDelay,
    orderRejection,
    orderTotal,
    pendingOrderRejection,
    portfolioSummary,
    positionPnl,
    replayTicks,
    topMovers,
} from './rules';
import type { Market, Position } from './types';
import { buildPendingOrder, buildPosition, buildPriceTick } from '@/test/factories';

describe('nextPrice', () => {
    it('moves the price by at most the volatility, rounded to cents', () => {
        expect(nextPrice(100, 0.01, () => 1)).toBe(101);
        expect(nextPrice(100, 0.01, () => 0)).toBe(99);
        expect(nextPrice(100.13, 0.003, () => 0.7)).toBe(100.25);
    });

    it('never drops to zero, even on a crash bigger than the price', () => {
        expect(nextPrice(0.01, 2, () => 0)).toBe(0.01);
    });
});

describe('nextTickDelay', () => {
    it('waits between the min and max delay', () => {
        expect(nextTickDelay(() => 0)).toBe(MIN_TICK_DELAY_MS);
        expect(nextTickDelay(() => 1)).toBe(MAX_TICK_DELAY_MS);
    });
});

describe('orderTotal', () => {
    it('is exact to the cent despite floating point', () => {
        expect(orderTotal(0.1, 3)).toBe(0.3);
        expect(orderTotal(228.57, 7)).toBe(1599.99);
    });
});

describe('orderRejection', () => {
    it('refuses a buy that costs more than the cash', () => {
        const rejection = orderRejection(
            { symbol: 'AAPL', side: 'buy', quantity: 3 },
            100,
            299.99,
            [],
        );

        expect(rejection).toBe('Insufficient funds: this order costs $300.00, you have $299.99');
    });

    it('accepts a buy that spends exactly the cash', () => {
        expect(
            orderRejection({ symbol: 'AAPL', side: 'buy', quantity: 3 }, 100, 300, []),
        ).toBeNull();
    });

    it('refuses to sell more than the user holds', () => {
        const positions = [buildPosition({ symbol: 'AAPL', quantity: 2 })];

        const rejection = orderRejection(
            { symbol: 'AAPL', side: 'sell', quantity: 3 },
            100,
            0,
            positions,
        );

        expect(rejection).toBe('You only hold 2 AAPL');
    });
});

const now = new Date('2026-10-14T10:00:00.000Z');

function buy(positions: Position[], quantity: number, price: number) {
    return executeOrder(positions, { symbol: 'AAPL', side: 'buy', quantity }, price, now);
}

function sell(positions: Position[], quantity: number, price: number) {
    return executeOrder(positions, { symbol: 'AAPL', side: 'sell', quantity }, price, now);
}

describe('executeOrder', () => {
    it('opens a position at the order price on a first buy', () => {
        const { positions } = buy([], 2, 100);

        expect(positions).toEqual([
            { symbol: 'AAPL', quantity: 2, averagePrice: 100, realizedPnl: 0, invested: 200 },
        ]);
    });

    it('averages the cost when buying more of a held asset', () => {
        const held = [buildPosition({ quantity: 2, averagePrice: 100 })];

        const { positions } = buy(held, 1, 130);

        expect(positions[0]).toMatchObject({ quantity: 3, averagePrice: 110, invested: 330 });
    });

    it('locks in the profit of a sell and keeps the average cost of what remains', () => {
        const held = [buildPosition({ quantity: 3, averagePrice: 110 })];

        const { order, positions } = sell(held, 1, 150.5);

        expect(order.realizedPnl).toBe(40.5);
        expect(positions[0]).toMatchObject({ quantity: 2, averagePrice: 110, realizedPnl: 40.5 });
    });

    it('records a loss as a negative realized profit', () => {
        const held = [buildPosition({ quantity: 2, averagePrice: 100 })];

        const { order } = sell(held, 2, 90);

        expect(order.realizedPnl).toBe(-20);
    });

    it('keeps a sold-out position for its realized profit', () => {
        const held = [buildPosition({ quantity: 2, averagePrice: 100, realizedPnl: 5 })];

        const { positions } = sell(held, 2, 110);

        expect(positions).toEqual([expect.objectContaining({ quantity: 0, realizedPnl: 25 })]);
    });

    it('keeps the positions in place instead of moving the traded one last', () => {
        const held = [buildPosition({ symbol: 'AAPL' }), buildPosition({ symbol: 'TSLA' })];

        const { positions } = buy(held, 1, 100);

        expect(positions.map(({ symbol }) => symbol)).toEqual(['AAPL', 'TSLA']);
    });
});

describe('pendingOrderRejection', () => {
    const stopLoss = { symbol: 'AAPL', type: 'stop_loss', quantity: 1 } as const;
    const takeProfit = { symbol: 'AAPL', type: 'take_profit', quantity: 1 } as const;

    it('refuses a stop loss at or above the current price, it would fire at once', () => {
        expect(pendingOrderRejection({ ...stopLoss, triggerPrice: 100 }, 100, 1, 0)).toEqual({
            field: 'triggerPrice',
            message: 'A stop loss must be below the current price ($100.00)',
        });
        expect(pendingOrderRejection({ ...stopLoss, triggerPrice: 99.99 }, 100, 1, 0)).toBeNull();
    });

    it('refuses a take profit at or below the current price', () => {
        expect(
            pendingOrderRejection({ ...takeProfit, triggerPrice: 100 }, 100, 1, 0),
        ).toMatchObject({
            field: 'triggerPrice',
        });
        expect(
            pendingOrderRejection({ ...takeProfit, triggerPrice: 100.01 }, 100, 1, 0),
        ).toBeNull();
    });

    it('refuses to protect more units than the user holds', () => {
        expect(
            pendingOrderRejection({ ...stopLoss, quantity: 3, triggerPrice: 90 }, 100, 2, 0),
        ).toEqual({ field: 'quantity', message: 'You only hold 2 AAPL' });
    });
});

describe('fillPendingOrders', () => {
    it('sells the quantity of a stop loss once the price drops through its trigger', () => {
        const stop = buildPendingOrder({ type: 'stop_loss', quantity: 2, triggerPrice: 95 });
        const state = {
            positions: [buildPosition({ quantity: 5, averagePrice: 100 })],
            pendingOrders: [stop],
        };

        const result = fillPendingOrders(state, { symbol: 'AAPL', price: 94.5 }, now, 0);

        expect(result.orders).toEqual([
            expect.objectContaining({
                side: 'sell',
                quantity: 2,
                price: 94.5,
                realizedPnl: -11,
                trigger: 'stop_loss',
            }),
        ]);
        expect(result.positions[0].quantity).toBe(3);
        expect(result.pendingOrders).toEqual([]);
    });

    it('fires a take profit once the price rises through its trigger', () => {
        const target = buildPendingOrder({ type: 'take_profit', triggerPrice: 110 });
        const state = { positions: [buildPosition({ quantity: 1 })], pendingOrders: [target] };

        const result = fillPendingOrders(state, { symbol: 'AAPL', price: 110 }, now, 0);

        expect(result.orders).toEqual([expect.objectContaining({ trigger: 'take_profit' })]);
    });

    it('leaves the orders whose trigger is not crossed, and other assets, untouched', () => {
        const pendingOrders = [
            buildPendingOrder({ symbol: 'AAPL', type: 'stop_loss', triggerPrice: 90 }),
            buildPendingOrder({ symbol: 'TSLA', type: 'stop_loss', triggerPrice: 300 }),
        ];
        const state = { positions: [buildPosition({ quantity: 1 })], pendingOrders };

        const result = fillPendingOrders(state, { symbol: 'AAPL', price: 95 }, now, 0);

        expect(result.orders).toEqual([]);
        expect(result.pendingOrders).toEqual(pendingOrders);
    });

    it('never sells more than what is still held', () => {
        const stop = buildPendingOrder({ quantity: 5, triggerPrice: 95 });
        const state = { positions: [buildPosition({ quantity: 2 })], pendingOrders: [stop] };

        const result = fillPendingOrders(state, { symbol: 'AAPL', price: 90 }, now, 0);

        expect(result.orders[0].quantity).toBe(2);
    });

    it('gives a distinct id to each order filled by the same tick', () => {
        // Same instant and same random draw: an id built from them would repeat
        vi.spyOn(Math, 'random').mockReturnValue(0.5);
        const stops = [
            buildPendingOrder({ quantity: 1, triggerPrice: 95 }),
            buildPendingOrder({ quantity: 1, triggerPrice: 92 }),
        ];
        const state = { positions: [buildPosition({ quantity: 2 })], pendingOrders: stops };

        const result = fillPendingOrders(state, { symbol: 'AAPL', price: 90 }, now, 0);

        expect(result.orders).toHaveLength(2);
        expect(result.orders[0].id).not.toBe(result.orders[1].id);
    });

    it('drops the other pending orders of an asset once it is sold out', () => {
        const stop = buildPendingOrder({ type: 'stop_loss', quantity: 2, triggerPrice: 95 });
        const target = buildPendingOrder({ type: 'take_profit', quantity: 2, triggerPrice: 120 });
        const state = {
            positions: [buildPosition({ quantity: 2 })],
            pendingOrders: [stop, target],
        };

        const result = fillPendingOrders(state, { symbol: 'AAPL', price: 90 }, now, 0);

        expect(result.pendingOrders).toEqual([]);
    });

    it('buys the quantity of a buy limit at the tick price once it drops to the limit', () => {
        const limit = buildPendingOrder({ type: 'buy_limit', quantity: 2, triggerPrice: 95 });
        const state = { positions: [], pendingOrders: [limit] };

        const result = fillPendingOrders(state, { symbol: 'AAPL', price: 94 }, now, 1000);

        expect(result.orders).toEqual([
            expect.objectContaining({ side: 'buy', quantity: 2, price: 94, trigger: 'buy_limit' }),
        ]);
        expect(result.positions).toEqual([
            expect.objectContaining({ symbol: 'AAPL', quantity: 2, averagePrice: 94 }),
        ]);
        expect(result.pendingOrders).toEqual([]);
    });

    it('keeps a buy limit waiting when the balance can no longer pay for it', () => {
        const limit = buildPendingOrder({ type: 'buy_limit', quantity: 2, triggerPrice: 95 });
        const state = { positions: [], pendingOrders: [limit] };

        const result = fillPendingOrders(state, { symbol: 'AAPL', price: 94 }, now, 100);

        expect(result.orders).toEqual([]);
        expect(result.pendingOrders).toEqual([limit]);
    });

    it('keeps the buy limits of an asset once its stop loss sold everything', () => {
        const stop = buildPendingOrder({ type: 'stop_loss', quantity: 2, triggerPrice: 95 });
        const limit = buildPendingOrder({ type: 'buy_limit', quantity: 1, triggerPrice: 80 });
        const state = { positions: [buildPosition({ quantity: 2 })], pendingOrders: [stop, limit] };

        const result = fillPendingOrders(state, { symbol: 'AAPL', price: 90 }, now, 0);

        expect(result.pendingOrders).toEqual([limit]);
    });
});

describe('availableCash', () => {
    it('keeps the cash promised to the buy limits out of what a new buy can spend', () => {
        const pendingOrders = [
            buildPendingOrder({ type: 'buy_limit', quantity: 2, triggerPrice: 100 }),
            buildPendingOrder({ type: 'stop_loss', quantity: 5, triggerPrice: 90 }),
        ];

        expect(availableCash(1000, pendingOrders)).toBe(800);
    });
});

describe('pendingOrderRejection of a buy limit', () => {
    const buyLimit = { symbol: 'AAPL', type: 'buy_limit', quantity: 2 } as const;

    it('refuses a limit at or above the current price, it would fill at once', () => {
        expect(pendingOrderRejection({ ...buyLimit, triggerPrice: 100 }, 100, 0, 1000)).toEqual({
            field: 'triggerPrice',
            message: 'A buy limit must be below the current price ($100.00)',
        });
    });

    it('refuses a limit whose cost is more than the available cash', () => {
        expect(pendingOrderRejection({ ...buyLimit, triggerPrice: 90 }, 100, 0, 179.99)).toEqual({
            field: 'quantity',
            message: 'Insufficient funds: this order reserves $180.00, you have $179.99 available',
        });
        expect(pendingOrderRejection({ ...buyLimit, triggerPrice: 90 }, 100, 0, 180)).toBeNull();
    });
});

describe('positionPnl', () => {
    it('splits the result into unrealized and realized, with returns in %', () => {
        // Bought 4 at 100 (400 invested), sold 2 at 110 (+20), 2 left at 100
        const position = buildPosition({
            quantity: 2,
            averagePrice: 100,
            realizedPnl: 20,
            invested: 400,
        });

        expect(positionPnl(position, 120)).toEqual({
            value: 240,
            unrealized: 40,
            unrealizedRatio: 0.2,
            realized: 20,
            total: 60,
            totalRatio: 0.15,
        });
    });
});

describe('portfolioSummary', () => {
    it('adds up every position, closed ones included, and values them at cost until their first price', () => {
        const positions = [
            buildPosition({ symbol: 'AAPL', quantity: 2, averagePrice: 100 }),
            buildPosition({ symbol: 'TSLA', quantity: 1, averagePrice: 200 }),
            buildPosition({
                symbol: 'NVDA',
                quantity: 0,
                averagePrice: 0,
                realizedPnl: -30,
                invested: 100,
            }),
        ];
        const market = applyTick({}, buildPriceTick({ symbol: 'AAPL', price: 110 }));

        expect(portfolioSummary(positions, market)).toEqual({
            value: 420,
            unrealized: 20,
            realized: -30,
            total: -10,
            totalRatio: -0.02,
        });
    });
});

describe('applyTick', () => {
    it('remembers the previous price to tell if the asset went up or down', () => {
        const market = applyTick({}, buildPriceTick({ symbol: 'AAPL', price: 100 }));

        const next = applyTick(market, buildPriceTick({ symbol: 'AAPL', price: 99 }));

        expect(next.AAPL).toMatchObject({ price: 99, previousPrice: 100 });
    });

    it('drops the oldest points once the history is full', () => {
        let market: Market = {};

        for (const price of [1, 2, 3, 4, 5]) {
            market = applyTick(market, buildPriceTick({ symbol: 'AAPL', price }), 3);
        }

        expect(market.AAPL.history.map(({ price }) => price)).toEqual([3, 4, 5]);
    });
});

describe('replayTicks', () => {
    it('lets a newcomer rebuild the same chart and day change as the server', () => {
        let server: Market = {};
        for (const price of [100, 102, 101]) {
            server = applyTick(server, buildPriceTick({ symbol: 'AAPL', open: 99, price }));
        }

        const client = replayTicks(server).reduce<Market>(
            (market, tick) => applyTick(market, tick),
            {},
        );

        expect(client.AAPL.history).toEqual(server.AAPL.history);
        expect(client.AAPL).toMatchObject({ price: 101, previousPrice: 102, open: 99 });
    });
});

describe('topMovers', () => {
    it('ranks the assets by how much they moved since the open, drops included', () => {
        let market: Market = {};
        for (const tick of [
            buildPriceTick({ symbol: 'AAPL', open: 100, price: 101 }),
            buildPriceTick({ symbol: 'TSLA', open: 100, price: 97 }),
            buildPriceTick({ symbol: 'NVDA', open: 100, price: 102 }),
        ]) {
            market = applyTick(market, tick);
        }

        expect(topMovers(market, 2).map(({ symbol }) => symbol)).toEqual(['TSLA', 'NVDA']);
    });
});
