import { describe, expect, it } from 'vitest';
import { listHref, matchesSearch } from './list-params';

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
