'use client';

import { ArcElement, Chart, DoughnutController, Tooltip } from 'chart.js';
import { collectionRate } from '../stats';
import type { AmountByStatus } from '../stats';
import { statusColorTokens, statusDotClasses, statusLabels } from '@/features/invoices/status';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useChart } from '@/hooks/useChart';
import { cssVar } from '@/lib/css-var';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { cn } from '@/lib/utils';

// Tree-shaking: register only what a doughnut needs instead of the whole library
Chart.register(DoughnutController, ArcElement, Tooltip);

type CollectionRateChartProps = {
    data: AmountByStatus;
};

export function CollectionRateChart({ data }: CollectionRateChartProps) {
    const rate = formatPercent(collectionRate(data));

    const canvasRef = useChart(
        () => ({
            type: 'doughnut',
            data: {
                labels: data.map(({ status }) => statusLabels[status]),
                datasets: [
                    {
                        data: data.map(({ total }) => total),
                        backgroundColor: data.map(({ status }) =>
                            cssVar(statusColorTokens[status]),
                        ),
                        // Card color as border = a small gap between the segments
                        borderColor: cssVar('--card'),
                        borderWidth: 2,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                // Half doughnut, from 9 to 3 o'clock: a gauge
                rotation: -90,
                circumference: 180,
                cutout: '75%',
                plugins: {
                    tooltip: {
                        callbacks: { label: (item) => formatCurrency(item.parsed) },
                    },
                },
            },
        }),
        data,
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Collection rate</CardTitle>
                <CardDescription>Share of the invoiced amount already paid</CardDescription>
            </CardHeader>
            <div className="relative h-40 px-4">
                <canvas
                    ref={canvasRef}
                    role="img"
                    aria-label={`Gauge: ${rate} of the invoiced amount is collected`}
                />
                {/* HTML on top of the canvas: crisper text than drawing it with a plugin */}
                <p className="absolute inset-x-0 bottom-0 text-center text-3xl font-semibold">
                    {rate}
                </p>
            </div>
            {/* Visible legend with the amounts, also readable by screen readers */}
            <dl className="grid grid-cols-3 gap-2 px-6 text-center">
                {data.map(({ status, total }) => (
                    <div key={status}>
                        <dt className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                            <span className={cn('size-2 rounded-full', statusDotClasses[status])} />
                            {statusLabels[status]}
                        </dt>
                        <dd className="font-medium">{formatCurrency(total)}</dd>
                    </div>
                ))}
            </dl>
        </Card>
    );
}
