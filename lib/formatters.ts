export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}

export function formatAmount(amount: string | number): string {
    if (amount === '') return '';

    return Number(amount).toFixed(2);
}

const relativeTimeFormat = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });

const RELATIVE_TIME_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
];

// "just now", "5 minutes ago", "yesterday"... Older than a week falls back to formatDate
export function formatRelativeTime(isoString: string, now: Date = new Date()): string {
    const seconds = Math.round((new Date(isoString).getTime() - now.getTime()) / 1000);
    if (Math.abs(seconds) < 60) return 'just now';
    if (Math.abs(seconds) >= 7 * 86_400) return formatDate(isoString);

    for (const [unit, unitSeconds] of RELATIVE_TIME_UNITS) {
        if (Math.abs(seconds) >= unitSeconds) {
            return relativeTimeFormat.format(Math.round(seconds / unitSeconds), unit);
        }
    }
    return 'just now';
}

export function formatDate(isoString: string): string {
    return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    });
}
