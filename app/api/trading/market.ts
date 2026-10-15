import { marketSnapshotSchema } from '@/features/trading/schema';
import { HttpError } from '@/lib/http-error';
import { MARKET_PRICES_URL } from '@/lib/realtime';

const MARKET_TIMEOUT_MS = 1000;

// The live prices belong to the market simulator (server/ws.ts), not to the Next API:
// an order is always filled at the price it has right now
export async function marketPrice(symbol: string): Promise<number> {
    let snapshot;
    try {
        const response = await fetch(MARKET_PRICES_URL, {
            signal: AbortSignal.timeout(MARKET_TIMEOUT_MS),
        });
        snapshot = marketSnapshotSchema.parse(await response.json());
    } catch {
        throw new HttpError(503, 'The market is closed: live prices are unavailable');
    }

    const tick = snapshot.find((tick) => tick.symbol === symbol);
    if (!tick) throw new HttpError(400, 'Unknown asset', 'symbol');
    return tick.price;
}
