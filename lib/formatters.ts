export function formatCurrency(amountCents: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amountCents / 100);
}

export function formatDate(isoString: string): string {
    return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    });
}
