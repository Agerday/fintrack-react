import { z } from 'zod';
import { hasAtMostTwoDecimals } from '@/lib/money';

export const tradeSides = ['buy', 'sell'] as const;
export const tradeSideSchema = z.enum(tradeSides);

// Conditional orders: they wait on the server and fire when the price crosses the trigger.
// Stop loss and take profit sell what is held, a buy limit buys once the price drops enough
export const pendingOrderTypes = ['stop_loss', 'take_profit', 'buy_limit'] as const;
export const pendingOrderTypeSchema = z.enum(pendingOrderTypes);

const quantitySchema = z
    .number({ error: 'Quantity is required' })
    .int('Quantity must be a whole number')
    .positive('Quantity must be greater than 0');

const symbolSchema = z.string().trim().min(1, 'Pick an asset');

// Market order: no price in the body, the API fills it at the live market price
export const orderSchema = z.object({
    symbol: symbolSchema,
    side: tradeSideSchema,
    quantity: quantitySchema,
});

// Whether the trigger sits on the right side of the live price is checked by the API:
// only it knows the price at the moment the order lands
function priceSchema(label: string) {
    return z
        .number({ error: `${label} is required` })
        .positive(`${label} must be greater than 0`)
        .refine(hasAtMostTwoDecimals, `${label} can have at most 2 decimals`);
}

export const pendingOrderSchema = z.object({
    symbol: symbolSchema,
    type: pendingOrderTypeSchema,
    quantity: quantitySchema,
    triggerPrice: priceSchema('Trigger price'),
});

// Pushed by the market simulator (server/ws.ts) on ws://.../market, and returned in bulk
// by its GET /prices. open = the price when the market opened, to show the day change
export const priceTickSchema = z.object({
    type: z.literal('price'),
    symbol: z.string(),
    price: z.number().positive(),
    open: z.number().positive(),
    time: z.string(),
});

export const marketSnapshotSchema = z.array(priceTickSchema);

// Pushed on the market socket when the server fills a stop loss or a take profit on its own:
// open tabs refresh the portfolio and tell the user
export const tradeExecutedEventSchema = z.object({
    type: z.literal('trade.executed'),
    trigger: pendingOrderTypeSchema,
    symbol: z.string(),
    quantity: z.number(),
    price: z.number(),
});

// Everything the market socket can carry
export const marketMessageSchema = z.discriminatedUnion('type', [
    priceTickSchema,
    tradeExecutedEventSchema,
]);

export type OrderFormValues = z.infer<typeof orderSchema>;
export type PendingOrderFormValues = z.infer<typeof pendingOrderSchema>;
