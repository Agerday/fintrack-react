'use client';

import { Users } from 'lucide-react';
import { BarController, BarElement, CategoryScale, Chart, LinearScale, Tooltip } from 'chart.js';
import type { AmountByClient } from '../stats';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { useChart } from '@/hooks/useChart';
import { cssVar } from '@/lib/css-var';
import { formatCurrency } from '@/lib/formatters';

// Tree-shaking: register only what a bar chart needs instead of the whole library
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

type AmountByClientChartProps = {
    data: AmountByClient;
};

export function AmountByClientChart({ data }: AmountByClientChartProps) {
    const canvasRef = useChart(() => {
        const mutedText = cssVar('--muted-foreground');
        return {
            type: 'bar',
            data: {
                labels: data.map(({ client }) => client),
                datasets: [
                    {
                        data: data.map(({ total }) => total),
                        backgroundColor: cssVar('--chart-1'),
                        borderRadius: 4,
                        // Rounded end only, the bar stays anchored to the axis
                        borderSkipped: 'start',
                        maxBarThickness: 28,
                    },
                ],
            },
            options: {
                // Horizontal bars: long client names stay readable on the left axis
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: { label: (item) => formatCurrency(item.parsed.x ?? 0) },
                    },
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        border: { display: false },
                        grid: { color: cssVar('--border') },
                        ticks: {
                            color: mutedText,
                            maxTicksLimit: 5,
                            callback: (value) => formatCurrency(Number(value)),
                        },
                    },
                    y: {
                        grid: { display: false },
                        border: { display: false },
                        ticks: { color: mutedText },
                    },
                },
            },
        };
    }, data);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Top clients</CardTitle>
                <CardDescription>Total invoiced amount per client</CardDescription>
            </CardHeader>
            {data.length ? (
                <>
                    {/* Chart.js needs a sized, relative parent to be responsive */}
                    <div className="relative h-64 px-4">
                        <canvas
                            ref={canvasRef}
                            role="img"
                            aria-label="Bar chart of the total invoiced amount per client"
                        />
                    </div>
                    {/* The canvas is invisible to screen readers: same numbers as a table */}
                    <table className="sr-only">
                        <caption>Total invoiced amount per client</caption>
                        <tbody>
                            {data.map(({ client, total }) => (
                                <tr key={client}>
                                    <th scope="row">{client}</th>
                                    <td>{formatCurrency(total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            ) : (
                <EmptyState
                    icon={Users}
                    title="No clients yet"
                    description="Invoice a client to see it here."
                />
            )}
        </Card>
    );
}
