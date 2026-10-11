import { describe, expect, it } from 'vitest';
import { sumAmounts } from './money';

describe('sumAmounts', () => {
    it('adds amounts without float drift', () => {
        expect(sumAmounts([0.1, 0.2])).toBe(0.3);
    });

    it('returns 0 for no amount', () => {
        expect(sumAmounts([])).toBe(0);
    });
});
