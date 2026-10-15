import { create } from 'zustand';
import { applyTick } from '@/features/trading/rules';
import type { Market, PriceTick, Quote } from '@/features/trading/types';
import type { ConnectionStatus } from '@/hooks/useWebSocket';

type MarketState = {
    market: Market;
    status: ConnectionStatus;
    applyTick: (tick: PriceTick) => void;
    setStatus: (status: ConnectionStatus) => void;
    reset: () => void;
};

// Live prices, fed by useMarketFeed (features/trading/hooks.ts). A store instead of component
// state so each component subscribes to the slice it shows, like a select() on an NgRx store:
// a tick of AAPL re-renders the AAPL row and the tables, not the forms or the order history
export const useMarketStore = create<MarketState>((set) => ({
    market: {},
    status: 'connecting',
    applyTick: (tick) => set((state) => ({ market: applyTick(state.market, tick) })),
    setStatus: (status) => set({ status }),
    reset: () => set({ market: {}, status: 'connecting' }),
}));

export function useQuote(symbol: string): Quote | undefined {
    return useMarketStore((state) => state.market[symbol]);
}

export function useMarketStatus(): ConnectionStatus {
    return useMarketStore((state) => state.status);
}

// Every asset: for the views that show them all (tables, P&L, top movers)
export function useMarketPrices(): Market {
    return useMarketStore((state) => state.market);
}
