import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { TopMovers } from './TopMovers';
import { marketFeed, tradingDb } from '@/test/msw/handlers/trading';
import { buildPriceTick } from '@/test/factories';
import { renderWithClient } from '@/test/render';

describe('TopMovers', () => {
    it('shows the three assets that moved the most, re-ranked on each tick', async () => {
        tradingDb.prices = [
            buildPriceTick({ symbol: 'AAPL', open: 100, price: 101 }),
            buildPriceTick({ symbol: 'MSFT', open: 100, price: 100.5 }),
            buildPriceTick({ symbol: 'NVDA', open: 100, price: 98 }),
            buildPriceTick({ symbol: 'TSLA', open: 100, price: 103 }),
        ];
        renderWithClient(<TopMovers />);
        const list = await screen.findByRole('list', { name: 'Top movers' });
        await within(list).findByText('TSLA');
        expect(within(list).queryByText('MSFT')).not.toBeInTheDocument();

        marketFeed.broadcast(
            JSON.stringify(buildPriceTick({ symbol: 'MSFT', open: 100, price: 105 })),
        );

        expect(await within(list).findByText('MSFT')).toBeInTheDocument();
        expect(within(list).queryByText('AAPL')).not.toBeInTheDocument();
    });
});
