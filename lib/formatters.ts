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

export function formatDate(isoString: string): string {
    return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    });
}
