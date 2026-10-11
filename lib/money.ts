// Summed in cents: adding floats drifts (0.1 + 0.2 = 0.30000000000000004), and every amount
// has at most 2 decimals, so the integer sum is exact
export function sumAmounts(amounts: number[]): number {
    const cents = amounts.reduce((sum, amount) => sum + Math.round(amount * 100), 0);
    return cents / 100;
}
