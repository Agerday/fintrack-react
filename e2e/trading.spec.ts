import { expect, test } from './fixtures';

// Positions live in the shared server store: each test trades its own asset and the trading
// fixture sells back what is left, so parallel runs never see each other's shares
test.describe('Live trading', () => {
    test('follows live prices, then buys and sells an asset', async ({ tradingPage, trading }) => {
        await tradingPage.goto();
        const nvda = tradingPage.market('NVDA');
        const firstQuote = await nvda.textContent();
        await expect(nvda).not.toHaveText(firstQuote ?? '');

        trading.watch('NVDA');
        await tradingPage.trade('NVDA', 'Buy', 2);
        await expect(tradingPage.page.getByText('Bought 2 NVDA at')).toBeVisible();
        await expect(tradingPage.position('NVDA')).not.toContainText('Closed');

        await tradingPage.trade('NVDA', 'Sell', 2);
        await expect(tradingPage.page.getByText('Sold 2 NVDA at')).toBeVisible();
        // A sold-out position stays listed for its realized profit
        await expect(tradingPage.position('NVDA')).toContainText('Closed');
    });

    test('sells a protected position on its own when the price crosses a trigger', async ({
        tradingPage,
        trading,
    }) => {
        // Page first: the alert is pushed on its socket, it must be open when the order fires
        await tradingPage.goto();
        await trading.buy('MSFT', 1);

        await trading.placeBracket('MSFT', 1);

        await expect(
            tradingPage.page.getByRole('button', { name: /Notifications \(\d+ unread\)/ }),
        ).toBeVisible();
        await tradingPage.page.getByRole('button', { name: /Notifications/ }).click();
        await expect(
            tradingPage.page.getByText(/(Stop loss|Take profit) hit on MSFT/),
        ).toBeVisible();
        await expect(tradingPage.position('MSFT')).toContainText('Closed');
    });

    test('places a buy limit that waits for its price', async ({ tradingPage, trading }) => {
        await tradingPage.goto();
        trading.watch('AMZN');

        await tradingPage.placeBuyLimit('AMZN', 1, 1);

        await expect(
            tradingPage.page.getByText('Buy limit placed: buy 1 AMZN at $1.00'),
        ).toBeVisible();
        await expect(
            tradingPage.page.getByRole('button', { name: 'Cancel buy limit on AMZN' }).first(),
        ).toBeVisible();
    });
});
