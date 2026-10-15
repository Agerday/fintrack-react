import type { NewNotification } from '@/features/notifications/types';
import { formatCurrency } from '@/lib/formatters';
import { sumAmounts } from '@/lib/money';
import type {
    Market,
    Order,
    PendingOrder,
    PendingOrderType,
    Position,
    PriceTick,
    Quote,
    TradeExecutedEvent,
    TradeSide,
} from './types';

// The simulator waits a random time between two ticks of the same asset
export const MIN_TICK_DELAY_MS = 300;
export const MAX_TICK_DELAY_MS = 3000;
// Points kept per asset for the chart: older ones scroll out
export const HISTORY_LENGTH = 60;
const MIN_PRICE = 0.01;

export const pendingOrderLabels: Record<PendingOrderType, string> = {
    stop_loss: 'Stop loss',
    take_profit: 'Take profit',
    buy_limit: 'Buy limit',
};

export function pendingOrderSide(type: PendingOrderType): TradeSide {
    return type === 'buy_limit' ? 'buy' : 'sell';
}

function roundToCents(amount: number): number {
    return Math.round(amount * 100) / 100;
}

// Random walk: the price moves by up to ±volatility (as a ratio) each tick.
// random is injected (Math.random by default) so tests can pin the outcome
export function nextPrice(price: number, volatility: number, random = Math.random): number {
    const change = (random() * 2 - 1) * volatility;
    return Math.max(MIN_PRICE, roundToCents(price * (1 + change)));
}

export function nextTickDelay(random = Math.random): number {
    return Math.round(MIN_TICK_DELAY_MS + random() * (MAX_TICK_DELAY_MS - MIN_TICK_DELAY_MS));
}

export function orderTotal(price: number, quantity: number): number {
    // In cents: 0.1 * 3 = 0.30000000000000004
    return (Math.round(price * 100) * quantity) / 100;
}

export function heldQuantity(positions: Position[], symbol: string): number {
    return positions.find((position) => position.symbol === symbol)?.quantity ?? 0;
}

// Cash promised to the buy limits waiting on the server, at their limit price: the most
// they can cost, since they fill at that price or lower
export function reservedCash(pendingOrders: PendingOrder[]): number {
    return sumAmounts(
        pendingOrders
            .filter((pending) => pending.type === 'buy_limit')
            .map((pending) => orderTotal(pending.triggerPrice, pending.quantity)),
    );
}

// What a new buy can spend: the bank balance minus what the buy limits already reserved
export function availableCash(balance: number, pendingOrders: PendingOrder[]): number {
    return sumAmounts([balance, -reservedCash(pendingOrders)]);
}

type OrderRequest = { symbol: string; side: TradeSide; quantity: number };

// Why a market order can't be filled, or null when it can. cash = availableCash(...)
export function orderRejection(
    { symbol, side, quantity }: OrderRequest,
    price: number,
    cash: number,
    positions: Position[],
): string | null {
    if (side === 'buy') {
        const total = orderTotal(price, quantity);
        return total > cash
            ? `Insufficient funds: this order costs ${formatCurrency(total)}, you have ${formatCurrency(cash)}`
            : null;
    }
    const held = heldQuantity(positions, symbol);
    return quantity > held ? `You only hold ${held} ${symbol}` : null;
}

function emptyPosition(symbol: string): Position {
    return { symbol, quantity: 0, averagePrice: 0, realizedPnl: 0, invested: 0 };
}

// Fills an order at `price` and returns it with the updated positions.
// Buying averages the new units into the cost. Selling locks in (price - average cost) per unit
// and keeps the cost of what remains. The position stays in place (no reordering in the UI)
export function executeOrder(
    positions: Position[],
    request: OrderRequest,
    price: number,
    now: Date,
    trigger?: PendingOrderType,
): { order: Order; positions: Position[] } {
    const current =
        positions.find((position) => position.symbol === request.symbol) ??
        emptyPosition(request.symbol);
    const total = orderTotal(price, request.quantity);
    let updated: Position;
    let realizedPnl: number | undefined;

    if (request.side === 'buy') {
        const quantity = current.quantity + request.quantity;
        const cost = sumAmounts([orderTotal(current.averagePrice, current.quantity), total]);
        updated = {
            ...current,
            quantity,
            averagePrice: roundToCents(cost / quantity),
            invested: sumAmounts([current.invested, total]),
        };
    } else {
        realizedPnl = sumAmounts([total, -orderTotal(current.averagePrice, request.quantity)]);
        updated = {
            ...current,
            quantity: current.quantity - request.quantity,
            realizedPnl: sumAmounts([current.realizedPnl, realizedPnl]),
        };
    }

    const order: Order = {
        ...request,
        id: `ORD-${crypto.randomUUID()}`,
        date: now.toISOString(),
        price,
        total,
        ...(realizedPnl !== undefined && { realizedPnl }),
        ...(trigger && { trigger }),
    };
    const exists = positions.some((position) => position.symbol === request.symbol);
    return {
        order,
        positions: exists
            ? positions.map((position) => (position.symbol === request.symbol ? updated : position))
            : [...positions, updated],
    };
}

type PendingOrderRequest = Pick<PendingOrder, 'symbol' | 'type' | 'quantity' | 'triggerPrice'>;

type PendingOrderRejection = { field: 'quantity' | 'triggerPrice'; message: string };

// Why a pending order can't be placed, with the field to blame, or null.
// A trigger on the wrong side of the price would fire at once: that's a market order.
// cash = availableCash(...): a buy limit reserves its cost, a sell needs the units held
export function pendingOrderRejection(
    { symbol, type, quantity, triggerPrice }: PendingOrderRequest,
    price: number,
    held: number,
    cash: number,
): PendingOrderRejection | null {
    if (type === 'buy_limit') {
        if (triggerPrice >= price) {
            return {
                field: 'triggerPrice',
                message: `A buy limit must be below the current price (${formatCurrency(price)})`,
            };
        }
        const total = orderTotal(triggerPrice, quantity);
        return total > cash
            ? {
                  field: 'quantity',
                  message: `Insufficient funds: this order reserves ${formatCurrency(total)}, you have ${formatCurrency(cash)} available`,
              }
            : null;
    }
    if (quantity > held) {
        return { field: 'quantity', message: `You only hold ${held} ${symbol}` };
    }
    if (type === 'stop_loss' && triggerPrice >= price) {
        return {
            field: 'triggerPrice',
            message: `A stop loss must be below the current price (${formatCurrency(price)})`,
        };
    }
    if (type === 'take_profit' && triggerPrice <= price) {
        return {
            field: 'triggerPrice',
            message: `A take profit must be above the current price (${formatCurrency(price)})`,
        };
    }
    return null;
}

export function createPendingOrder(request: PendingOrderRequest, now: Date): PendingOrder {
    return {
        ...request,
        id: `PND-${crypto.randomUUID()}`,
        createdAt: now.toISOString(),
    };
}

// <= / >=, not ===: prices jump from tick to tick and rarely land on the trigger exactly.
// A stop loss and a buy limit wait for a drop, a take profit for a rise
export function isTriggered(pending: PendingOrder, price: number): boolean {
    return pending.type === 'take_profit'
        ? price >= pending.triggerPrice
        : price <= pending.triggerPrice;
}

type TradingState = { positions: Position[]; pendingOrders: PendingOrder[] };

// An order filled by a pending order, not by the user
export type TriggeredOrder = Order & { trigger: PendingOrderType };

// Runs on every tick: fills the pending orders of that asset whose trigger is crossed, at the
// tick price. cash = the bank balance, to pay the buy limits.
// - A sell never sells more than what is still held (a manual sell may have come first), and
//   once nothing is left the other sell orders of that asset are dropped
// - A buy limit the balance can't pay for waits for the next tick instead of overdrawing
export function fillPendingOrders(
    { positions, pendingOrders }: TradingState,
    tick: Pick<PriceTick, 'symbol' | 'price'>,
    now: Date,
    cash: number,
): TradingState & { orders: TriggeredOrder[] } {
    const triggered = pendingOrders.filter(
        (pending) => pending.symbol === tick.symbol && isTriggered(pending, tick.price),
    );
    if (!triggered.length) return { positions, pendingOrders, orders: [] };

    const orders: TriggeredOrder[] = [];
    const done: PendingOrder[] = [];
    let current = positions;
    let balance = cash;
    for (const pending of triggered) {
        const side = pendingOrderSide(pending.type);
        const quantity =
            side === 'buy'
                ? pending.quantity
                : Math.min(pending.quantity, heldQuantity(current, tick.symbol));
        if (side === 'buy' && orderTotal(tick.price, quantity) > balance) continue;

        done.push(pending);
        if (quantity === 0) continue;

        const result = executeOrder(
            current,
            { symbol: tick.symbol, side, quantity },
            tick.price,
            now,
            pending.type,
        );
        current = result.positions;
        balance = sumAmounts([balance, side === 'buy' ? -result.order.total : result.order.total]);
        orders.push({ ...result.order, trigger: pending.type });
    }

    const soldOut = heldQuantity(current, tick.symbol) === 0;
    return {
        positions: current,
        pendingOrders: pendingOrders.filter(
            (pending) =>
                !done.includes(pending) &&
                !(
                    soldOut &&
                    pending.symbol === tick.symbol &&
                    pendingOrderSide(pending.type) === 'sell'
                ),
        ),
        orders,
    };
}

export function marketValue(position: Position, price: number): number {
    return orderTotal(price, position.quantity);
}

// Gain (or loss, < 0) if the units still held were sold now
export function unrealizedPnl(position: Position, price: number): number {
    return sumAmounts([
        marketValue(position, price),
        -orderTotal(position.averagePrice, position.quantity),
    ]);
}

// Share of `amount` in `base`, 0 when there is no base (nothing bought yet)
function ratioOf(amount: number, base: number): number {
    return base ? amount / base : 0;
}

// Everything the table shows for one asset. Unrealized % is on the cost of what is held,
// total % on everything ever spent on it
export function positionPnl(position: Position, price: number) {
    const unrealized = unrealizedPnl(position, price);
    const total = sumAmounts([unrealized, position.realizedPnl]);
    return {
        value: marketValue(position, price),
        unrealized,
        unrealizedRatio: ratioOf(unrealized, orderTotal(position.averagePrice, position.quantity)),
        realized: position.realizedPnl,
        total,
        totalRatio: ratioOf(total, position.invested),
    };
}

// Before the first tick of an asset arrives, its position is valued at cost
export function portfolioSummary(positions: Position[], market: Market) {
    const rows = positions.map((position) =>
        positionPnl(position, market[position.symbol]?.price ?? position.averagePrice),
    );
    const total = sumAmounts(rows.map((row) => row.total));
    return {
        value: sumAmounts(rows.map((row) => row.value)),
        unrealized: sumAmounts(rows.map((row) => row.unrealized)),
        realized: sumAmounts(rows.map((row) => row.realized)),
        total,
        totalRatio: ratioOf(total, sumAmounts(positions.map((position) => position.invested))),
    };
}

export function tradeExecutedEvent(order: TriggeredOrder): TradeExecutedEvent {
    return {
        type: 'trade.executed',
        trigger: order.trigger,
        symbol: order.symbol,
        quantity: order.quantity,
        price: order.price,
    };
}

// A stop loss is a warning (it cut a loss), a take profit or a buy limit a success
export function tradeExecutedNotification(event: TradeExecutedEvent): NewNotification {
    const verb = pendingOrderSide(event.trigger) === 'buy' ? 'Bought' : 'Sold';
    return {
        type: event.trigger === 'stop_loss' ? 'warning' : 'success',
        title: `${pendingOrderLabels[event.trigger]} hit on ${event.symbol}`,
        message: `${verb} ${event.quantity} ${event.symbol} at ${formatCurrency(event.price)}`,
        href: '/trading',
    };
}

// 0.012 = +1.2% since the market opened
export function changeRatio(price: number, open: number): number {
    return (price - open) / open;
}

// Client-side reducer: folds one socket tick into the market state, keeping a bounded history
export function applyTick(market: Market, tick: PriceTick, historyLength = HISTORY_LENGTH): Market {
    const quote: Quote | undefined = market[tick.symbol];
    const history = [...(quote?.history ?? []), { time: tick.time, price: tick.price }];

    return {
        ...market,
        [tick.symbol]: {
            symbol: tick.symbol,
            price: tick.price,
            previousPrice: quote?.price ?? tick.price,
            time: tick.time,
            open: tick.open,
            history: history.slice(-historyLength),
        },
    };
}

// What a newcomer receives on connection: the kept history of every asset as ticks, oldest
// first, so applyTick rebuilds the same chart instead of starting from a single point
export function replayTicks(market: Market): PriceTick[] {
    return Object.values(market).flatMap(({ symbol, open, history }) =>
        history.map(({ time, price }) => ({ type: 'price' as const, symbol, price, open, time })),
    );
}

// The latest tick of every asset, as served by the simulator's GET /prices
export function latestTicks(market: Market): PriceTick[] {
    return Object.values(market).map(({ symbol, price, open, time }) => ({
        type: 'price',
        symbol,
        price,
        open,
        time,
    }));
}

// The assets that moved the most since the open, up or down: a -3% drop beats a +1% gain
export function topMovers(market: Market, count: number): Quote[] {
    return Object.values(market)
        .sort(
            (a, b) =>
                Math.abs(changeRatio(b.price, b.open)) - Math.abs(changeRatio(a.price, a.open)),
        )
        .slice(0, count);
}
