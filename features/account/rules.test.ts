import { describe, expect, it } from 'vitest';
import { balanceOf, toAccount, tradeTransaction } from './rules';
import { buildOrder, buildTransaction } from '@/test/factories';

describe('balanceOf', () => {
    it('sums the amounts without floating point drift', () => {
        const transactions = [{ amount: 0.1 }, { amount: 0.2 }, { amount: 1250.5 }];

        expect(balanceOf(transactions)).toBe(1250.8);
    });

    it('subtracts debits from credits', () => {
        expect(balanceOf([{ amount: 500 }, { amount: -120.25 }])).toBe(379.75);
    });
});

describe('toAccount', () => {
    it('lists the transactions newest first, whatever the stored order', () => {
        const oldest = buildTransaction({ date: '2026-09-01T10:00:00.000Z' });
        const middle = buildTransaction({ date: '2026-09-08T10:00:00.000Z' });
        const newest = buildTransaction({ date: '2026-09-15T10:00:00.000Z' });

        const account = toAccount([middle, oldest, newest]);

        expect(account.transactions).toEqual([newest, middle, oldest]);
    });
});

describe('tradeTransaction', () => {
    it('debits the account for a buy and credits it for a sell', () => {
        const buy = tradeTransaction(buildOrder({ side: 'buy', quantity: 2, price: 50 }));
        const sell = tradeTransaction(buildOrder({ side: 'sell', quantity: 2, price: 50 }));

        expect(buy).toMatchObject({ amount: -100, label: 'Bought 2 AAPL' });
        expect(sell).toMatchObject({ amount: 100, label: 'Sold 2 AAPL' });
    });
});
