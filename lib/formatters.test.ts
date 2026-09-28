import { describe, expect, it } from 'vitest';
import { formatDate, formatRelativeTime } from './formatters';

const now = new Date('2026-09-28T12:00:00.000Z');

function secondsAgo(seconds: number) {
    return new Date(now.getTime() - seconds * 1000).toISOString();
}

describe('formatRelativeTime', () => {
    it.each([
        { label: '30 seconds', seconds: 30, expected: 'just now' },
        { label: '5 minutes', seconds: 5 * 60, expected: '5 minutes ago' },
        { label: '3 hours', seconds: 3 * 3_600, expected: '3 hours ago' },
        { label: '1 day', seconds: 86_400, expected: 'yesterday' },
    ])('shows "$expected" for $label ago', ({ seconds, expected }) => {
        expect(formatRelativeTime(secondsAgo(seconds), now)).toBe(expected);
    });

    it('falls back to the date after a week', () => {
        const eightDaysAgo = secondsAgo(8 * 86_400);

        expect(formatRelativeTime(eightDaysAgo, now)).toBe(formatDate(eightDaysAgo));
    });
});
