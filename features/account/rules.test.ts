import { describe, expect, it } from 'vitest';
import { balanceOf, toAccount } from './rules';
import { buildTransaction } from '@/test/factories';

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
