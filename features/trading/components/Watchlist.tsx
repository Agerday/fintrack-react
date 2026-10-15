import { ArrowDown, ArrowUp } from 'lucide-react';
import { assets } from '../data';
import type { Market } from '../types';
import { PriceChange } from './PriceChange';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';

type WatchlistProps = {
    market: Market;
    selected: string;
    onSelect: (symbol: string) => void;
};

export function Watchlist({ market, selected, onSelect }: WatchlistProps) {
    return (
        <Card className="gap-0 pb-0">
            <CardHeader className="border-b">
                <CardTitle>Markets</CardTitle>
            </CardHeader>
            <ul className="divide-y" aria-label="Markets">
                {assets.map(({ symbol, name }) => {
                    const quote = market[symbol];
                    const up = quote && quote.price > quote.previousPrice;
                    const down = quote && quote.price < quote.previousPrice;

                    return (
                        <li key={symbol}>
                            <button
                                type="button"
                                onClick={() => onSelect(symbol)}
                                aria-pressed={symbol === selected}
                                className={cn(
                                    'flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50',
                                    symbol === selected && 'bg-muted',
                                )}
                            >
                                <span className="min-w-0">
                                    <span className="block text-sm font-medium">{symbol}</span>
                                    <span className="block truncate text-xs text-muted-foreground">
                                        {name}
                                    </span>
                                </span>
                                {quote ? (
                                    <span className="text-right">
                                        {/* New key on every tick: remounts the span, which
                                            replays the fade-in, a short flash on each update */}
                                        <span
                                            key={quote.time}
                                            className={cn(
                                                'flex items-center justify-end gap-1 text-sm font-medium tabular-nums animate-in fade-in duration-500',
                                                up && 'text-success',
                                                down && 'text-destructive',
                                            )}
                                        >
                                            {up && <ArrowUp className="size-3" aria-hidden />}
                                            {down && <ArrowDown className="size-3" aria-hidden />}
                                            {formatCurrency(quote.price)}
                                        </span>
                                        <PriceChange
                                            price={quote.price}
                                            open={quote.open}
                                            className="text-xs"
                                        />
                                    </span>
                                ) : (
                                    <Skeleton className="h-8 w-20" />
                                )}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </Card>
    );
}
