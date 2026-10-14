import type { Transaction } from '@/features/account/types';
import type { ClientRecord } from '@/features/clients/types';
import type { Invoice } from '@/features/invoices/types';
import { orderTotal } from '@/features/trading/rules';
import type { Order, PendingOrder, Position, PriceTick } from '@/features/trading/types';

let invoiceSequence = 0;

// Valid by default: a test only overrides the fields its behavior depends on
export function buildInvoice(overrides: Partial<Invoice> = {}): Invoice {
    invoiceSequence += 1;
    return {
        id: `INV-${String(invoiceSequence).padStart(3, '0')}`,
        client: `Client ${invoiceSequence}`,
        date: '2026-09-01T00:00:00.000Z',
        amount: 100,
        status: 'pending',
        ...overrides,
    };
}

let clientSequence = 0;

export function buildClient(overrides: Partial<ClientRecord> = {}): ClientRecord {
    clientSequence += 1;
    return {
        id: `CLI-${String(clientSequence).padStart(3, '0')}`,
        name: `Client ${clientSequence}`,
        email: `client${clientSequence}@example.com`,
        phone: '+32 470000000',
        company: `Company ${clientSequence}`,
        ...overrides,
    };
}

let transactionSequence = 0;

export function buildTransaction(overrides: Partial<Transaction> = {}): Transaction {
    transactionSequence += 1;
    return {
        id: `TRX-${String(transactionSequence).padStart(3, '0')}`,
        date: '2026-09-01T00:00:00.000Z',
        type: 'invoice_payment',
        label: `Payment ${transactionSequence}`,
        amount: 100,
        ...overrides,
    };
}

let orderSequence = 0;

export function buildOrder(overrides: Partial<Order> = {}): Order {
    orderSequence += 1;
    const quantity = overrides.quantity ?? 1;
    const price = overrides.price ?? 100;
    return {
        id: `ORD-${String(orderSequence).padStart(3, '0')}`,
        date: '2026-09-01T00:00:00.000Z',
        symbol: 'AAPL',
        side: 'buy',
        quantity,
        price,
        total: orderTotal(price, quantity),
        ...overrides,
    };
}

// invested defaults to what the held units cost: no sell yet
export function buildPosition(overrides: Partial<Position> = {}): Position {
    const quantity = overrides.quantity ?? 1;
    const averagePrice = overrides.averagePrice ?? 100;
    return {
        symbol: 'AAPL',
        quantity,
        averagePrice,
        realizedPnl: 0,
        invested: orderTotal(averagePrice, quantity),
        ...overrides,
    };
}

let pendingOrderSequence = 0;

export function buildPendingOrder(overrides: Partial<PendingOrder> = {}): PendingOrder {
    pendingOrderSequence += 1;
    return {
        id: `PND-${String(pendingOrderSequence).padStart(3, '0')}`,
        createdAt: '2026-09-01T00:00:00.000Z',
        symbol: 'AAPL',
        type: 'stop_loss',
        quantity: 1,
        triggerPrice: 90,
        ...overrides,
    };
}

export function buildPriceTick(overrides: Partial<PriceTick> = {}): PriceTick {
    return {
        type: 'price',
        symbol: 'AAPL',
        price: 100,
        open: 100,
        time: '2026-09-01T10:00:00.000Z',
        ...overrides,
    };
}
