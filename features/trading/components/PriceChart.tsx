'use client';

import {
    CategoryScale,
    Chart,
    Filler,
    LinearScale,
    LineController,
    LineElement,
    PointElement,
    Tooltip,
} from 'chart.js';
import { pendingOrderLabels } from '../rules';
import type { Asset, PendingOrder, PendingOrderType } from '../types';
import { PriceChange } from './PriceChange';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useChart } from '@/hooks/useChart';
import { cssVar } from '@/lib/css-var';
import { formatCurrency, formatTime } from '@/lib/formatters';
import { useMarketStatus, useQuote } from '@/lib/store/useMarketStore';

// Tree-shaking: register only what a line chart needs instead of the whole library
Chart.register(
    LineController,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Filler,
    Tooltip,
);

const levelColors: Record<PendingOrderType, string> = {
    stop_loss: '--destructive',
    take_profit: '--success',
    buy_limit: '--primary',
};

type PriceChartProps = {
    asset: Asset;
    // Pending orders of this asset, drawn as dashed levels
    pendingOrders: PendingOrder[];
};

export function PriceChart({ asset, pendingOrders }: PriceChartProps) {
    const quote = useQuote(asset.symbol);
    const live = useMarketStatus() === 'open';
    // The chart redraws when this key changes: on each tick of THIS asset, or when one of its
    // levels is added or removed. A string, so a new array with the same levels is no change
    const redrawKey = [quote?.time, ...pendingOrders.map(({ id }) => id)].join('|');
    const canvasRef = useChart(() => {
        const history = quote?.history ?? [];
        const up = !quote || quote.price >= quote.open;
        const color = cssVar(up ? '--success' : '--destructive');
        const mutedText = cssVar('--muted-foreground');

        return {
            type: 'line',
            data: {
                labels: history.map(({ time }) => formatTime(time)),
                datasets: [
                    {
                        label: 'Price',
                        data: history.map(({ price }) => price),
                        borderColor: color,
                        // Theme tokens are oklch(L C H): add an alpha for a light fill
                        backgroundColor: color.replace(/\)$/, ' / 0.15)'),
                        borderWidth: 2,
                        fill: true,
                        pointRadius: 0,
                        tension: 0.3,
                    },
                    // A flat line per level: same value on every point of the history
                    ...pendingOrders.map((pending) => ({
                        label: pendingOrderLabels[pending.type],
                        data: history.map(() => pending.triggerPrice),
                        borderColor: cssVar(levelColors[pending.type]),
                        borderWidth: 1,
                        borderDash: [6, 4],
                        pointRadius: 0,
                    })),
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                interaction: { mode: 'index', intersect: false },
                scales: {
                    x: { ticks: { color: mutedText, maxTicksLimit: 6 }, grid: { display: false } },
                    y: {
                        ticks: { color: mutedText, callback: (value) => formatCurrency(+value) },
                        grid: { color: cssVar('--border') },
                    },
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (item) =>
                                `${item.dataset.label}: ${formatCurrency(item.parsed.y ?? 0)}`,
                        },
                    },
                },
            },
        };
    }, redrawKey);

    return (
        <Card>
            <CardHeader>
                <CardDescription>
                    {asset.name} · {asset.symbol}
                    {!live && quote && ' · Prices paused'}
                </CardDescription>
                <CardTitle className="flex items-baseline gap-3 text-3xl tabular-nums">
                    {quote ? formatCurrency(quote.price) : <Skeleton className="h-9 w-32" />}
                    {quote && (
                        <PriceChange price={quote.price} open={quote.open} className="text-base" />
                    )}
                </CardTitle>
            </CardHeader>
            <div className="h-64 px-4 sm:h-72">
                <canvas
                    ref={canvasRef}
                    role="img"
                    aria-label={`Live price chart of ${asset.name}`}
                />
            </div>
        </Card>
    );
}
