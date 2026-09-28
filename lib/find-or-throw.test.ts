import { describe, expect, it } from 'vitest';
import { findOrThrow } from './find-or-throw';
import { HttpError } from './http-error';

const items = [
    { id: 'INV-001', amount: 100 },
    { id: 'INV-002', amount: 200 },
];

describe('findOrThrow', () => {
    it('returns the item with the matching id', () => {
        // toBe = same reference (===), toEqual = same content (deep equality)
        expect(findOrThrow(items, 'INV-002', 'Invoice')).toBe(items[1]);
    });

    it('throws a 404 HttpError naming the resource when the id is unknown', () => {
        // To test a throw, pass a FUNCTION to expect: if we called findOrThrow directly,
        // it would throw before expect() could catch it
        expect(() => findOrThrow(items, 'INV-999', 'Invoice')).toThrow('Invoice not found');

        // toThrow only checks the message. To check other properties, catch the error by hand
        try {
            findOrThrow(items, 'INV-999', 'Invoice');
            expect.unreachable('findOrThrow should have thrown');
        } catch (error) {
            expect(error).toBeInstanceOf(HttpError);
            expect(error).toMatchObject({ status: 404 });
        }
    });
});
