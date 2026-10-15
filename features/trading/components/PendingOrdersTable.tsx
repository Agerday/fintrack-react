'use client';

import { BellRing, X } from 'lucide-react';
import { useCancelPendingOrder } from '../hooks';
import { changeRatio, pendingOrderLabels } from '../rules';
import type { Market, PendingOrder } from '../types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type Column, DataTable } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatCurrency, formatSignedPercent } from '@/lib/formatters';

type PendingOrderRow = PendingOrder & {
    // How far the price still has to move to fire it, undefined before the first tick
    distance?: number;
};

const columns: Column<PendingOrderRow>[] = [
    { key: 'symbol', header: 'Asset', className: 'font-medium' },
    {
        key: 'type',
        header: 'Type',
        render: (value) => (
            <Badge variant={value === 'stop_loss' ? 'destructive' : 'secondary'}>
                {pendingOrderLabels[value]}
            </Badge>
        ),
    },
    { key: 'quantity', header: 'Quantity', className: 'text-right tabular-nums' },
    {
        key: 'triggerPrice',
        header: 'Trigger price',
        className: 'text-right tabular-nums',
        render: (value) => formatCurrency(value),
    },
    {
        key: 'distance',
        header: 'Distance',
        className: 'text-right tabular-nums text-muted-foreground',
        render: (value) => (value === undefined ? '—' : formatSignedPercent(value)),
    },
];

type CancelButtonProps = {
    pending: PendingOrder;
};

function CancelButton({ pending }: CancelButtonProps) {
    const { mutate, isPending } = useCancelPendingOrder();

    return (
        <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Cancel ${pendingOrderLabels[pending.type].toLowerCase()} on ${pending.symbol}`}
            disabled={isPending}
            onClick={() => mutate(pending.id)}
        >
            <X />
        </Button>
    );
}

type PendingOrdersTableProps = {
    pendingOrders: PendingOrder[];
    market: Market;
};

export function PendingOrdersTable({ pendingOrders, market }: PendingOrdersTableProps) {
    if (!pendingOrders.length) {
        return (
            <EmptyState
                icon={BellRing}
                title="No pending orders"
                description="Protect a position with a stop loss or lock in a gain with a take profit."
            />
        );
    }

    const rows = pendingOrders.map((pending) => {
        const price = market[pending.symbol]?.price;
        return {
            ...pending,
            distance: price === undefined ? undefined : changeRatio(pending.triggerPrice, price),
        };
    });

    return (
        <DataTable
            columns={columns}
            data={rows}
            rowKey="id"
            renderActions={(pending) => <CancelButton pending={pending} />}
        />
    );
}
