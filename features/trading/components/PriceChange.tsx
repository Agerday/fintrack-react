import { changeRatio } from '../rules';
import { formatSignedPercent } from '@/lib/formatters';
import { cn } from '@/lib/utils';

type PriceChangeProps = {
    price: number;
    open: number;
    className?: string;
};

// Change since the market opened, green when up, red when down
export function PriceChange({ price, open, className }: PriceChangeProps) {
    const ratio = changeRatio(price, open);

    return (
        <span
            className={cn(
                'tabular-nums',
                ratio > 0 && 'text-success',
                ratio < 0 && 'text-destructive',
                className,
            )}
        >
            {formatSignedPercent(ratio)}
        </span>
    );
}
