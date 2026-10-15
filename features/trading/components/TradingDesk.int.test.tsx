import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { TradingDesk } from './TradingDesk';
import { accountDb } from '@/test/msw/handlers/account';
import { marketFeed, tradingDb } from '@/test/msw/handlers/trading';
import {
    buildOrder,
    buildPendingOrder,
    buildPosition,
    buildPriceTick,
    buildTransaction,
} from '@/test/factories';
import { useNotificationStore } from '@/lib/store/useNotificationStore';
import { renderWithClient } from '@/test/render';

function sideButton(name: string) {
    return within(screen.getByRole('group', { name: 'Side' })).getByRole('button', { name });
}

function orderTypeButton(name: string) {
    return within(screen.getByRole('group', { name: 'Order type' })).getByRole('button', { name });
}

function summaryTile(label: string) {
    return screen.getByRole('group', { name: label });
}

function marketRow(symbol: string) {
    return screen.getByRole('button', { name: new RegExp(`^${symbol}`) });
}

describe('TradingDesk', () => {
    // jsdom has no canvas: without this stub every chart render logs "Not implemented"
    beforeEach(() => {
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    });

    it('shows the live price of each asset and follows the next ticks', async () => {
        tradingDb.prices = [buildPriceTick({ symbol: 'AAPL', price: 100, open: 100 })];
        renderWithClient(<TradingDesk />);
        await screen.findByText('Live');
        expect(marketRow('AAPL')).toHaveTextContent('$100.00');

        marketFeed.broadcast(JSON.stringify(buildPriceTick({ symbol: 'AAPL', price: 101.5 })));

        expect(await within(marketRow('AAPL')).findByText('$101.50')).toBeInTheDocument();
        expect(marketRow('AAPL')).toHaveTextContent('+1.50%');
    });

    it('buys an asset with the cash of the bank account', async () => {
        accountDb.transactions = [buildTransaction({ amount: 1000 })];
        tradingDb.prices = [buildPriceTick({ symbol: 'AAPL', price: 100 })];
        const { user } = renderWithClient(<TradingDesk />);
        await screen.findByText('Live');

        await user.clear(screen.getByLabelText('Quantity'));
        await user.type(screen.getByLabelText('Quantity'), '3');
        await user.click(screen.getByRole('button', { name: 'Buy AAPL' }));

        expect(await screen.findByText('Bought 3 AAPL at $100.00')).toBeInTheDocument();
        expect(
            await within(screen.getByRole('group', { name: 'Available cash' })).findByText(
                '$700.00',
            ),
        ).toBeInTheDocument();
        expect(screen.getAllByRole('row', { name: /AAPL/ })[0]).toHaveTextContent('$300.00');
    });

    it('shows why the order was refused', async () => {
        accountDb.transactions = [buildTransaction({ amount: 50 })];
        tradingDb.prices = [buildPriceTick({ symbol: 'AAPL', price: 100 })];
        const { user } = renderWithClient(<TradingDesk />);
        await screen.findByText('Live');

        await user.click(screen.getByRole('button', { name: 'Buy AAPL' }));

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Insufficient funds: this order costs $100.00, you have $50.00',
        );
    });

    it('rejects a fractional quantity before calling the API', async () => {
        tradingDb.prices = [buildPriceTick({ symbol: 'AAPL', price: 100 })];
        const { user } = renderWithClient(<TradingDesk />);
        await screen.findByText('Live');

        await user.clear(screen.getByLabelText('Quantity'));
        await user.type(screen.getByLabelText('Quantity'), '1.5');
        await user.click(screen.getByRole('button', { name: 'Buy AAPL' }));

        expect(await screen.findByText('Quantity must be a whole number')).toBeInTheDocument();
    });

    it('does not let the user sell an asset they do not hold', async () => {
        tradingDb.prices = [buildPriceTick({ symbol: 'AAPL', price: 100 })];
        renderWithClient(<TradingDesk />);
        await screen.findByText('Live');

        expect(sideButton('Sell')).toBeDisabled();
    });

    it('lets the user sell an asset they hold', async () => {
        tradingDb.positions = [buildPosition({ symbol: 'AAPL', quantity: 2 })];
        tradingDb.prices = [buildPriceTick({ symbol: 'AAPL', price: 100 })];
        renderWithClient(<TradingDesk />);

        await waitFor(() => expect(sideButton('Sell')).toBeEnabled());
    });

    it('values the positions at the live price', async () => {
        tradingDb.positions = [buildPosition({ symbol: 'AAPL', quantity: 2, averagePrice: 100 })];
        tradingDb.prices = [buildPriceTick({ symbol: 'AAPL', price: 100 })];
        renderWithClient(<TradingDesk />);
        await screen.findByText('Live');

        marketFeed.broadcast(JSON.stringify(buildPriceTick({ symbol: 'AAPL', price: 90 })));

        expect(
            await within(summaryTile('Total P&L')).findByText('-$20.00 (-10.00%)'),
        ).toBeVisible();
    });

    it('adds the profit locked in by past sells to the total', async () => {
        tradingDb.positions = [
            buildPosition({
                symbol: 'AAPL',
                quantity: 1,
                averagePrice: 100,
                realizedPnl: 50,
                invested: 250,
            }),
        ];
        tradingDb.prices = [buildPriceTick({ symbol: 'AAPL', price: 110 })];
        renderWithClient(<TradingDesk />);

        expect(await within(summaryTile('Realized P&L')).findByText('+$50.00')).toBeVisible();
        expect(within(summaryTile('Unrealized P&L')).getByText('+$10.00')).toBeVisible();
        expect(within(summaryTile('Total P&L')).getByText('+$60.00 (+24.00%)')).toBeVisible();
    });

    it('lists the past orders with the profit of each sell', async () => {
        tradingDb.orders = [
            buildOrder({
                side: 'sell',
                quantity: 2,
                price: 120,
                realizedPnl: 40,
                trigger: 'take_profit',
            }),
        ];
        renderWithClient(<TradingDesk />);

        const row = (await screen.findAllByRole('row', { name: /Take profit/ }))[0];
        expect(row).toHaveTextContent('+$40.00');
    });

    it('only offers a stop loss or take profit on an asset the user holds', async () => {
        tradingDb.prices = [buildPriceTick({ symbol: 'AAPL', price: 100 })];
        renderWithClient(<TradingDesk />);
        await screen.findByText('Live');

        expect(orderTypeButton('Stop loss')).toBeDisabled();
        expect(orderTypeButton('Take profit')).toBeDisabled();
    });

    it('places a stop loss for the quantity the user chose', async () => {
        tradingDb.positions = [buildPosition({ symbol: 'AAPL', quantity: 3 })];
        tradingDb.prices = [buildPriceTick({ symbol: 'AAPL', price: 100 })];
        const { user } = renderWithClient(<TradingDesk />);
        await waitFor(() => expect(orderTypeButton('Stop loss')).toBeEnabled());

        await user.click(orderTypeButton('Stop loss'));
        await user.type(screen.getByLabelText('Quantity to sell'), '2');
        await user.type(screen.getByLabelText('Trigger price'), '95');
        await user.click(screen.getByRole('button', { name: 'Place stop loss' }));

        expect(
            await screen.findByText('Stop loss placed: sell 2 AAPL at $95.00'),
        ).toBeInTheDocument();
        // DataTable renders a desktop table and mobile cards: the button exists twice
        expect(
            await screen.findAllByRole('button', { name: 'Cancel stop loss on AAPL' }),
        ).not.toHaveLength(0);
    });

    it('requires the quantity of a stop loss instead of assuming one', async () => {
        tradingDb.positions = [buildPosition({ symbol: 'AAPL', quantity: 3 })];
        tradingDb.prices = [buildPriceTick({ symbol: 'AAPL', price: 100 })];
        const { user } = renderWithClient(<TradingDesk />);
        await waitFor(() => expect(orderTypeButton('Stop loss')).toBeEnabled());

        await user.click(orderTypeButton('Stop loss'));
        await user.type(screen.getByLabelText('Trigger price'), '95');
        await user.click(screen.getByRole('button', { name: 'Place stop loss' }));

        expect(await screen.findByText('Quantity is required')).toBeInTheDocument();
        expect(tradingDb.pendingOrders).toEqual([]);
    });

    it('shows under the trigger price why the API refused it', async () => {
        tradingDb.positions = [buildPosition({ symbol: 'AAPL', quantity: 3 })];
        tradingDb.prices = [buildPriceTick({ symbol: 'AAPL', price: 100 })];
        const { user } = renderWithClient(<TradingDesk />);
        await waitFor(() => expect(orderTypeButton('Stop loss')).toBeEnabled());

        await user.click(orderTypeButton('Stop loss'));
        await user.type(screen.getByLabelText('Quantity to sell'), '1');
        await user.type(screen.getByLabelText('Trigger price'), '105');
        await user.click(screen.getByRole('button', { name: 'Place stop loss' }));

        expect(
            await screen.findByText('A stop loss must be below the current price ($100.00)'),
        ).toBeInTheDocument();
    });

    it('cancels a pending order', async () => {
        tradingDb.pendingOrders = [buildPendingOrder({ symbol: 'TSLA', type: 'take_profit' })];
        const { user } = renderWithClient(<TradingDesk />);

        await user.click(
            (await screen.findAllByRole('button', { name: 'Cancel take profit on TSLA' }))[0],
        );

        expect(await screen.findByText('No pending orders')).toBeInTheDocument();
    });

    it('alerts the user and refreshes the portfolio when a stop loss fires', async () => {
        tradingDb.positions = [buildPosition({ symbol: 'AAPL', quantity: 2 })];
        tradingDb.prices = [buildPriceTick({ symbol: 'AAPL', price: 100 })];
        renderWithClient(<TradingDesk />);
        await screen.findByText('Live');
        await screen.findAllByRole('row', { name: /^AAPL/ });

        // What the server did on its own when the price crossed the stop loss
        tradingDb.positions = [buildPosition({ symbol: 'AAPL', quantity: 0, averagePrice: 0 })];
        marketFeed.broadcast(
            JSON.stringify({
                type: 'trade.executed',
                trigger: 'stop_loss',
                symbol: 'AAPL',
                quantity: 2,
                price: 94,
            }),
        );

        expect((await screen.findAllByText('Closed'))[0]).toBeInTheDocument();
        expect(useNotificationStore.getState().notifications).toEqual([
            expect.objectContaining({
                title: 'Stop loss hit on AAPL',
                message: 'Sold 2 AAPL at $94.00',
            }),
        ]);
    });
});
