import { History } from 'lucide-react';
import { pendingOrderLabels } from '../rules';
import type { Order } from '../types';
import { PnlAmount } from './PnlAmount';
import { Badge } from '@/components/ui/badge';
import { type Column, DataTable } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatCurrency, formatDate, formatTime } from '@/lib/formatters';

const columns: Column<Order>[] = [
    {
        key: 'date',
        header: 'Date',
        className: 'text-muted-foreground tabular-nums',
        render: (value) => `${formatDate(value)} ${formatTime(value)}`,
    },
    { key: 'symbol', header: 'Asset', className: 'font-medium' },
    {
        key: 'side',
        header: 'Order',
        render: (value, order) => (
            <span className="flex items-center gap-2">
                {value === 'buy' ? 'Buy' : 'Sell'}
                {order.trigger && (
                    <Badge variant={order.trigger === 'stop_loss' ? 'destructive' : 'secondary'}>
                        {pendingOrderLabels[order.trigger]}
                    </Badge>
                )}
            </span>
        ),
    },
    { key: 'quantity', header: 'Quantity', className: 'text-right tabular-nums' },
    {
        key: 'price',
        header: 'Price',
        className: 'text-right tabular-nums',
        render: (value) => formatCurrency(value),
    },
    {
        key: 'total',
        header: 'Total',
        className: 'text-right tabular-nums',
        render: (value) => formatCurrency(value),
    },
    {
        key: 'realizedPnl',
        header: 'Realized P&L',
        className: 'text-right',
        // Buys realize nothing
        render: (value) => (value === undefined ? '—' : <PnlAmount amount={value} />),
    },
];

type OrderHistoryProps = {
    orders: Order[];
};

export function OrderHistory({ orders }: OrderHistoryProps) {
    if (!orders.length) {
        return <EmptyState icon={History} title="No orders yet" />;
    }
    return <DataTable columns={columns} data={orders} rowKey="id" />;
}
