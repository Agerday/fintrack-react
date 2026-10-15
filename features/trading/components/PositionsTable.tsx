import { Briefcase } from 'lucide-react';
import { positionPnl } from '../rules';
import type { Market, Position } from '../types';
import { PnlAmount } from './PnlAmount';
import { type Column, DataTable } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatCurrency } from '@/lib/formatters';

type PositionRow = ReturnType<typeof positionPnl> & {
    symbol: string;
    quantity: number;
    averagePrice: number;
    price: number;
};

const columns: Column<PositionRow>[] = [
    { key: 'symbol', header: 'Asset', className: 'font-medium' },
    {
        key: 'quantity',
        header: 'Quantity',
        className: 'text-right tabular-nums',
        // Fully sold: kept for its realized profit
        render: (value) => (value ? value : 'Closed'),
    },
    {
        key: 'averagePrice',
        header: 'Average cost',
        className: 'text-right tabular-nums',
        render: (value, row) => (row.quantity ? formatCurrency(value) : '—'),
    },
    {
        key: 'price',
        header: 'Price',
        className: 'text-right tabular-nums',
        render: (value) => formatCurrency(value),
    },
    {
        key: 'value',
        header: 'Value',
        className: 'text-right tabular-nums',
        render: (value) => formatCurrency(value),
    },
    {
        key: 'unrealized',
        header: 'Unrealized P&L',
        className: 'text-right',
        render: (value, row) =>
            row.quantity ? <PnlAmount amount={value} ratio={row.unrealizedRatio} /> : '—',
    },
    {
        key: 'realized',
        header: 'Realized P&L',
        className: 'text-right',
        render: (value) => <PnlAmount amount={value} />,
    },
    {
        key: 'total',
        header: 'Total P&L',
        className: 'text-right font-medium',
        render: (value, row) => <PnlAmount amount={value} ratio={row.totalRatio} />,
    },
];

type PositionsTableProps = {
    positions: Position[];
    market: Market;
};

export function PositionsTable({ positions, market }: PositionsTableProps) {
    if (!positions.length) {
        return (
            <EmptyState
                icon={Briefcase}
                title="No positions yet"
                description="Buy an asset and it shows up here with its live profit and loss."
            />
        );
    }

    const rows = positions.map((position) => {
        // Valued at cost until the first tick of the asset arrives
        const price = market[position.symbol]?.price ?? position.averagePrice;
        return {
            symbol: position.symbol,
            quantity: position.quantity,
            averagePrice: position.averagePrice,
            price,
            ...positionPnl(position, price),
        };
    });

    return <DataTable columns={columns} data={rows} />;
}
