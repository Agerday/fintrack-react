import type { z } from 'zod';
import type {
    pendingOrderTypeSchema,
    priceTickSchema,
    tradeExecutedEventSchema,
    tradeSideSchema,
} from './schema';

export type TradeSide = z.infer<typeof tradeSideSchema>;
export type PendingOrderType = z.infer<typeof pendingOrderTypeSchema>;
export type PriceTick = z.infer<typeof priceTickSchema>;
export type TradeExecutedEvent = z.infer<typeof tradeExecutedEventSchema>;

// A tradable asset and how the simulator moves its price
export type Asset = {
    symbol: string;
    name: string;
    initialPrice: number;
    // Max move per tick, as a ratio: 0.004 = up to ±0.4%
    volatility: number;
};

// Everything the user did on one asset. Kept once fully sold (quantity 0): its realized
// profit is still part of the portfolio result
export type Position = {
    symbol: string;
    quantity: number;
    // What one unit still held cost on average, to compute the unrealized P&L
    averagePrice: number;
    // Profit (or loss, < 0) locked in by the sells
    realizedPnl: number;
    // Total spent on buys, the base of the return in %
    invested: number;
};

// An executed order, as returned by POST /api/trading/orders and listed by GET
export type Order = {
    id: string;
    date: string;
    symbol: string;
    side: TradeSide;
    quantity: number;
    price: number;
    total: number;
    // Sells only: (price - average cost) x quantity
    realizedPnl?: number;
    // Set when a stop loss or a take profit filled it, absent for a manual market order
    trigger?: PendingOrderType;
};

// A stop loss, take profit or buy limit waiting for its trigger price
export type PendingOrder = {
    id: string;
    createdAt: string;
    symbol: string;
    type: PendingOrderType;
    quantity: number;
    triggerPrice: number;
    // Shared by the two legs of an OCO order: when one fires or is cancelled, so is the other
    ocoId?: string;
};

export type PricePoint = {
    time: string;
    price: number;
};

// Client-side view of one asset, built tick after tick from the socket
export type Quote = {
    symbol: string;
    price: number;
    // Price before the last tick: tells if it just went up or down
    previousPrice: number;
    // When the last tick arrived
    time: string;
    open: number;
    history: PricePoint[];
};

export type Market = Record<string, Quote>;
