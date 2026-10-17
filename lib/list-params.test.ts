import { describe, expect, it } from 'vitest';
import { listHref, matchesSearch, nextSort, paginate, sortBy } from './list-params';

describe('sortBy', () => {
    it('sorts a copy, leaving the cached list in its order', () => {
        const items = [{ n: 2 }, { n: 3 }, { n: 1 }];

        const sorted = sortBy(items, (item) => item.n, 'desc');

        expect(sorted.map((item) => item.n)).toEqual([3, 2, 1]);
        expect(items.map((item) => item.n)).toEqual([2, 3, 1]);
    });

    it('sorts text alphabetically, ignoring case', () => {
        const sorted = sortBy([{ s: 'beta' }, { s: 'Alpha' }], (item) => item.s, 'asc');

        expect(sorted.map((item) => item.s)).toEqual(['Alpha', 'beta']);
    });
});

describe('nextSort', () => {
    it('flips the direction of the sorted column', () => {
        expect(nextSort({ sort: 'date', dir: 'desc' }, 'date', 'desc')).toEqual({
            sort: 'date',
            dir: 'asc',
        });
    });

    it('sorts another column in its first direction', () => {
        expect(nextSort({ sort: 'date', dir: 'asc' }, 'client', 'asc')).toEqual({
            sort: 'client',
            dir: 'asc',
        });
    });
});

describe('paginate', () => {
    const items = Array.from({ length: 25 }, (_, index) => index);

    it('returns the items of the page and the page count', () => {
        expect(paginate(items, 3, 10)).toEqual({
            items: [20, 21, 22, 23, 24],
            page: 3,
            pageCount: 3,
        });
    });

    it('shows the last page for a page past the end, e.g. after deletions', () => {
        expect(paginate(items, 9, 10).page).toBe(3);
    });

    it('has one empty page when there is nothing to show', () => {
        expect(paginate([], 1, 10)).toEqual({ items: [], page: 1, pageCount: 1 });
    });
});

describe('listHref', () => {
    const defaults = { q: '', status: 'all' };

    it('leaves the params at their default out of the URL', () => {
        expect(listHref('/invoices', { q: '', status: 'paid' }, defaults)).toBe(
            '/invoices?status=paid',
        );
        expect(listHref('/invoices', defaults, defaults)).toBe('/invoices');
    });

    it('encodes the search so it cannot break the query string', () => {
        expect(listHref('/invoices', { q: 'a&b=c', status: 'all' }, defaults)).toBe(
            '/invoices?q=a%26b%3Dc',
        );
    });
});

describe('matchesSearch', () => {
    it('matches any field, ignoring case', () => {
        expect(matchesSearch(['INV-001', 'Acme Corp'], 'acme')).toBe(true);
        expect(matchesSearch(['INV-001', 'Acme Corp'], 'inv-001')).toBe(true);
        expect(matchesSearch(['INV-001', 'Acme Corp'], 'globex')).toBe(false);
    });

    it('matches everything when the search is empty', () => {
        expect(matchesSearch(['Acme'], '')).toBe(true);
    });
});
