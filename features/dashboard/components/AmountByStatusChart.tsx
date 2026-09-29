'use client';

import { useEffect, useRef } from 'react';
import { BarController, BarElement, CategoryScale, Chart, LinearScale, Tooltip } from 'chart.js';
import type { AmountByStatus } from '../stats';
import type { InvoiceStatus } from '@/features/invoices/types';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';

// Tree-shaking: register only what a bar chart needs instead of the whole library
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

const statusLabels: Record<InvoiceStatus, string> = {
    paid: 'Paid',
    pending: 'Pending',
    overdue: 'Overdue',
};

// Same tokens as InvoiceStatusBadge: canvas can't read Tailwind classes, only real colors
const statusColorTokens: Record<InvoiceStatus, string> = {
    paid: '--status-paid',
    pending: '--status-pending',
    overdue: '--destructive',
};

function cssVar(name: string) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

type AmountByStatusChartProps = {
    data: AmountByStatus;
};

export function AmountByStatusChart({ data }: AmountByStatusChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Chart.js is imperative: it draws on a <canvas> it owns. Create it after mount and
    // destroy it in the cleanup (like ngAfterViewInit + ngOnDestroy), otherwise every data
    // change would stack a new chart on the same canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const mutedText = cssVar('--muted-foreground');
        const chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: data.map(({ status }) => statusLabels[status]),
                datasets: [
                    {
                        data: data.map(({ total }) => total),
                        backgroundColor: data.map(({ status }) =>
                            cssVar(statusColorTokens[status]),
                        ),
                        borderRadius: 4,
                        // Rounded top only, the bar stays anchored to the baseline
                        borderSkipped: 'bottom',
                        maxBarThickness: 48,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                font: { family: getComputedStyle(document.body).fontFamily },
                plugins: {
                    tooltip: {
                        callbacks: { label: (item) => formatCurrency(item.parsed.y ?? 0) },
                    },
                },
                scales: {
                    x: {
                        grid: { display: false },
                        border: { display: false },
                        ticks: { color: mutedText },
                    },
                    y: {
                        beginAtZero: true,
                        border: { display: false },
                        grid: { color: cssVar('--border') },
                        ticks: {
                            color: mutedText,
                            maxTicksLimit: 5,
                            callback: (value) => formatCurrency(Number(value)),
                        },
                    },
                },
            },
        });

        return () => chart.destroy();
    }, [data]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Amount by status</CardTitle>
                <CardDescription>Total invoiced amount per status</CardDescription>
            </CardHeader>
            {/* Chart.js needs a sized, relative parent to be responsive */}
            <div className="relative h-64 px-4">
                <canvas
                    ref={canvasRef}
                    role="img"
                    aria-label="Bar chart of the total invoiced amount per status"
                />
            </div>
            {/* The canvas is invisible to screen readers: same numbers as a table */}
            <table className="sr-only">
                <caption>Total invoiced amount per status</caption>
                <tbody>
                    {data.map(({ status, total }) => (
                        <tr key={status}>
                            <th scope="row">{statusLabels[status]}</th>
                            <td>{formatCurrency(total)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
    );
}
