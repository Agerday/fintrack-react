// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { GET } from './route';
import { accountStore } from './store';
import { buildTransaction } from '@/test/factories';

describe('/api/account', () => {
    it('returns the balance of the stored transactions along with them', async () => {
        const credit = buildTransaction({ amount: 2400 });
        const debit = buildTransaction({ amount: -400 });
        accountStore.transactions = [credit, debit];

        const response = await GET();

        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject({
            balance: 2000,
            transactions: expect.arrayContaining([credit, debit]),
        });
    });
});
