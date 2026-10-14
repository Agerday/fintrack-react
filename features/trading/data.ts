import type { Asset, Order, PendingOrder, Position } from './types';

// Starting prices of the simulated market. Each one then moves on its own random schedule
export const assets: Asset[] = [
    { symbol: 'AAPL', name: 'Apple', initialPrice: 228.5, volatility: 0.003 },
    { symbol: 'MSFT', name: 'Microsoft', initialPrice: 415.2, volatility: 0.0025 },
    { symbol: 'NVDA', name: 'Nvidia', initialPrice: 124.8, volatility: 0.006 },
    { symbol: 'TSLA', name: 'Tesla', initialPrice: 251.3, volatility: 0.008 },
    { symbol: 'AMZN', name: 'Amazon', initialPrice: 186.4, volatility: 0.004 },
    { symbol: 'ETH', name: 'Ethereum', initialPrice: 2480, volatility: 0.01 },
];

// The demo starts with an empty portfolio: the cash comes from the paid invoices
export const positions: Position[] = [];
export const orders: Order[] = [];
export const pendingOrders: PendingOrder[] = [];
