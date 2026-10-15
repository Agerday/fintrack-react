'use client';

import { ArrowDown, ArrowUp } from 'lucide-react';
import { assets } from '../data';
import { changeRatio } from '../rules';
import type { Asset } from '../types';
import { PriceChange } from './PriceChange';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/formatters';
import { useMarketStatus, useQuote } from '@/lib/store/useMarketStore';
import { cn } from '@/lib/utils';

type WatchlistRowProps = {
    asset: Asset;
    selected: boolean;
    onSelect: (symbol: string) => void;
};

// Its own component so it subscribes to its own quote: a tick of AAPL re-renders this row only
function WatchlistRow({ asset: { symbol, name }, selected, onSelect }: WatchlistRowProps) {
    const quote = useQuote(symbol);
    // Feed down: the last prices stay on screen, greyed out, so nobody takes them for live ones
    const live = useMarketStatus() === 'open';

    // The color follows the change since the open, like the % below: one up tick on a falling
    // asset must not paint it green. The arrow alone shows the direction of the last tick.
    const ratio = quote ? changeRatio(quote.price, quote.open) : 0;
    const tickUp = quote && quote.price > quote.previousPrice;
    const tickDown = quote && quote.price < quote.previousPrice;

    return (
        <li>
            <button
                type="button"
                onClick={() => onSelect(symbol)}
                aria-pressed={selected}
                className={cn(
                    'flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50',
                    selected && 'bg-muted',
                )}
            >
                <span className="min-w-0">
                    <span className="block text-sm font-medium">{symbol}</span>
                    <span className="block truncate text-xs text-muted-foreground">{name}</span>
                </span>
                {quote ? (
                    <span className={cn('text-right', !live && 'opacity-50')}>
                        {/* New key on every tick: remounts the span, which replays the
                            fade-in, a short flash on each update */}
                        <span
                            key={quote.time}
                            className={cn(
                                'flex items-center justify-end gap-1 text-sm font-medium tabular-nums animate-in fade-in duration-500',
                                live && ratio > 0 && 'text-success',
                                live && ratio < 0 && 'text-destructive',
                            )}
                        >
                            {tickUp && (
                                <ArrowUp className="size-3 text-muted-foreground" aria-hidden />
                            )}
                            {tickDown && (
                                <ArrowDown className="size-3 text-muted-foreground" aria-hidden />
                            )}
                            {formatCurrency(quote.price)}
                        </span>
                        <PriceChange price={quote.price} open={quote.open} className="text-xs" />
                    </span>
                ) : (
                    <Skeleton className="h-8 w-20" />
                )}
            </button>
        </li>
    );
}

type WatchlistProps = {
    selected: string;
    onSelect: (symbol: string) => void;
};

export function Watchlist({ selected, onSelect }: WatchlistProps) {
    return (
        <Card className="gap-0 pb-0">
            <CardHeader className="border-b">
                <CardTitle>Markets</CardTitle>
            </CardHeader>
            <ul className="divide-y" aria-label="Markets">
                {assets.map((asset) => (
                    <WatchlistRow
                        key={asset.symbol}
                        asset={asset}
                        selected={asset.symbol === selected}
                        onSelect={onSelect}
                    />
                ))}
            </ul>
        </Card>
    );
}
