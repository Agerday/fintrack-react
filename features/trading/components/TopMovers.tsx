'use client';

import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { assets } from '../data';
import { useMarketFeed } from '../hooks';
import { topMovers } from '../rules';
import { ConnectionBadge } from '@/components/shared/ConnectionBadge';
import { PriceChange } from './PriceChange';
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/formatters';
import { useMarketPrices, useMarketStatus } from '@/lib/store/useMarketStore';
import { cn } from '@/lib/utils';

const MOVERS_COUNT = 3;

// Same live feed as the trading page: the dashboard opens its own market socket
export function TopMovers() {
    useMarketFeed();
    const status = useMarketStatus();
    const movers = topMovers(useMarketPrices(), MOVERS_COUNT);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Top movers</CardTitle>
                <CardDescription>Biggest moves since the market opened</CardDescription>
                <CardAction>
                    <ConnectionBadge status={status} />
                </CardAction>
            </CardHeader>
            <ul className="grid gap-3 px-4 sm:grid-cols-3" aria-label="Top movers">
                {movers.length
                    ? movers.map((quote) => {
                          const up = quote.price >= quote.open;
                          const Arrow = up ? ArrowUpRight : ArrowDownRight;
                          const name = assets.find(({ symbol }) => symbol === quote.symbol)?.name;

                          return (
                              <li key={quote.symbol}>
                                  <Link
                                      href="/trading"
                                      className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                  >
                                      <span className="min-w-0">
                                          <span className="block text-sm font-medium">
                                              {quote.symbol}
                                          </span>
                                          <span className="block truncate text-xs text-muted-foreground">
                                              {name}
                                          </span>
                                      </span>
                                      <span className="text-right">
                                          <span className="block text-sm font-medium tabular-nums">
                                              {formatCurrency(quote.price)}
                                          </span>
                                          <span className="flex items-center justify-end gap-0.5 text-xs">
                                              <Arrow
                                                  aria-hidden
                                                  className={cn(
                                                      'size-3',
                                                      up ? 'text-success' : 'text-destructive',
                                                  )}
                                              />
                                              <PriceChange price={quote.price} open={quote.open} />
                                          </span>
                                      </span>
                                  </Link>
                              </li>
                          );
                      })
                    : Array.from({ length: MOVERS_COUNT }, (_, index) => (
                          <li key={index}>
                              <Skeleton className="h-16 rounded-lg" />
                          </li>
                      ))}
            </ul>
        </Card>
    );
}
