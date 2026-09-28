import type { LucideIcon } from 'lucide-react';
import { TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';

export type StatCardProps = {
    label: string;
    value: number;
    valueType?: 'number' | 'currency';
    change: string;
    icon: LucideIcon;
};

export function StatCard({
    label,
    value,
    valueType = 'number',
    change,
    icon: Icon,
}: StatCardProps) {
    const formattedValue =
        valueType === 'currency' ? formatCurrency(value) : value.toLocaleString('en-US');

    return (
        <Card className="gap-0 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <div className="hidden size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground sm:flex">
                    <Icon className="size-4" />
                </div>
            </div>

            <p className="mt-2 text-xl font-semibold sm:mt-3 sm:text-2xl tracking-tight tabular-nums">
                {formattedValue}
            </p>

            <p className="mt-1 flex flex-wrap items-center gap-x-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-0.5 font-medium text-success">
                    <TrendingUp className="size-3.5" />
                    {change}
                </span>
                from last month
            </p>
        </Card>
    );
}
