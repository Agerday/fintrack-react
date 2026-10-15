import { test as base, expect, type APIRequestContext, type Page } from '@playwright/test';
import type { Invoice } from '@/features/invoices/types';
import type { PendingOrder, Position, PriceTick } from '@/features/trading/types';
import { MARKET_PRICES_URL } from '@/lib/realtime';

export class InvoicesPage {
    constructor(readonly page: Page) {}

    // The HTML is server-rendered, but clicks and shortcuts only work after hydration.
    // The table is only rendered client-side after the fetch, so once visible, React runs
    async goto() {
        await this.page.goto('/invoices');
        await expect(this.page.getByRole('table')).toBeVisible();
    }

    row(text: string) {
        return this.page.getByRole('row', { name: new RegExp(text) });
    }

    async markAsPaid(text: string) {
        await this.row(text).getByRole('button', { name: 'Mark as paid' }).click();
    }

    async delete(text: string) {
        await this.row(text).getByRole('button', { name: 'Delete invoice' }).click();
        // exact: Playwright matches names as substrings, 'Delete' would also match the row buttons
        await this.page
            .getByRole('alertdialog')
            .getByRole('button', { name: 'Delete', exact: true })
            .click();
    }
}

export class TradingPage {
    constructor(readonly page: Page) {}

    // "Live" = the market socket is open, so prices arrive and the page is hydrated
    async goto() {
        await this.page.goto('/trading');
        await expect(this.page.getByRole('status').filter({ hasText: 'Live' })).toBeVisible();
    }

    market(symbol: string) {
        return this.page.getByRole('button', { name: new RegExp(`^${symbol}`) });
    }

    position(symbol: string) {
        return this.page.getByRole('row', { name: new RegExp(`^${symbol}`) });
    }

    async trade(symbol: string, side: 'Buy' | 'Sell', quantity: number) {
        await this.market(symbol).click();
        await this.page
            .getByRole('group', { name: 'Side' })
            .getByRole('button', { name: side })
            .click();
        await this.page.getByLabel('Quantity', { exact: true }).fill(String(quantity));
        await this.page.getByRole('button', { name: `${side} ${symbol}` }).click();
    }
}

// Arranges trades through the API and undoes them after the test: positions and pending
// orders live in the shared server store, every other test would see them otherwise
export class TradingApi {
    private readonly symbols = new Set<string>();

    constructor(private readonly request: APIRequestContext) {}

    // For an asset the test trades through the UI: still cleaned up afterwards
    watch(symbol: string) {
        this.symbols.add(symbol);
    }

    async buy(symbol: string, quantity: number) {
        this.symbols.add(symbol);
        const response = await this.request.post('/api/trading/orders', {
            data: { symbol, side: 'buy', quantity },
        });
        expect(response.status()).toBe(201);
    }

    // A stop loss 1 cent under the live price and a take profit 1 cent above: the first tick
    // that moves at least 2 cents fires one of them, whichever way the random walk goes.
    // The price can move between reading it and placing the orders (the API then answers
    // 400), so the whole step is retried
    async placeBracket(symbol: string, quantity: number) {
        this.symbols.add(symbol);
        await expect(async () => {
            await this.cancelPendingOrders(symbol);
            const prices = (await (
                await this.request.get(MARKET_PRICES_URL)
            ).json()) as PriceTick[];
            const price = prices.find((tick) => tick.symbol === symbol)?.price ?? 0;
            for (const [type, triggerPrice] of [
                ['stop_loss', price - 0.01],
                ['take_profit', price + 0.01],
            ] as const) {
                const response = await this.request.post('/api/trading/pending-orders', {
                    data: {
                        symbol,
                        type,
                        quantity,
                        triggerPrice: Math.round(triggerPrice * 100) / 100,
                    },
                });
                expect(response.status()).toBe(201);
            }
        }).toPass();
    }

    private async cancelPendingOrders(symbol: string) {
        const pending = (await (
            await this.request.get('/api/trading/pending-orders')
        ).json()) as PendingOrder[];
        for (const order of pending.filter((p) => p.symbol === symbol)) {
            await this.request.delete(`/api/trading/pending-orders/${order.id}`);
        }
    }

    async cleanUp() {
        const positions = (await (
            await this.request.get('/api/trading/positions')
        ).json()) as Position[];
        for (const symbol of this.symbols) {
            await this.cancelPendingOrders(symbol);
            const quantity = positions.find((p) => p.symbol === symbol)?.quantity ?? 0;
            if (quantity) {
                await this.request.post('/api/trading/orders', {
                    data: { symbol, side: 'sell', quantity },
                });
            }
        }
    }
}

type Fixtures = {
    // Unique per test; every invoice of this client is deleted after the test
    client: string;
    // Arranges an invoice for `client` through the API
    createInvoice: (amount?: number) => Promise<Invoice>;
    invoicesPage: InvoicesPage;
    tradingPage: TradingPage;
    trading: TradingApi;
};

// E2E runs against the real server: without this cleanup, test invoices stay in its store.
// Paid invoices are refused (409, their money is on the account) and stay until a restart
async function deleteInvoicesOf(request: APIRequestContext, client: string) {
    const invoices = (await (await request.get('/api/invoices')).json()) as Invoice[];
    for (const invoice of invoices.filter((i) => i.client === client)) {
        await request.delete(`/api/invoices/${invoice.id}`);
    }
}

export const test = base.extend<Fixtures>({
    client: async ({ request }, use, testInfo) => {
        const client = `E2E ${testInfo.workerIndex}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        await use(client);
        await deleteInvoicesOf(request, client);
    },

    createInvoice: async ({ request, client }, use) => {
        await use(async (amount = 100) => {
            const response = await request.post('/api/invoices', { data: { client, amount } });
            expect(response.status()).toBe(201);
            return (await response.json()) as Invoice;
        });
    },

    invoicesPage: async ({ page }, use) => {
        await use(new InvoicesPage(page));
    },

    tradingPage: async ({ page }, use) => {
        await use(new TradingPage(page));
    },

    trading: async ({ request }, use) => {
        const trading = new TradingApi(request);
        await use(trading);
        await trading.cleanUp();
    },
});

export { expect };
