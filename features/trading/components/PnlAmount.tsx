import { formatSignedCurrency, formatSignedPercent } from '@/lib/formatters';
import { cn } from '@/lib/utils';

type PnlAmountProps = {
    amount: number;
    // Return in % shown next to the amount, e.g. "+$30.00 (+10.00%)"
    ratio?: number;
    className?: string;
};

// Profit in green, loss in red, zero neutral
export function PnlAmount({ amount, ratio, className }: PnlAmountProps) {
    return (
        <span
            className={cn(
                'tabular-nums',
                amount > 0 && 'text-success',
                amount < 0 && 'text-destructive',
                className,
            )}
        >
            {formatSignedCurrency(amount)}
            {ratio !== undefined && ` (${formatSignedPercent(ratio)})`}
        </span>
    );
}
