'use client';

import Link from 'next/link';
import type { Invoice } from '../types';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { InvoiceActions } from './InvoiceActions';
import { Column, DataTable } from '@/components/ui/DataTable';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { useInvoiceEvents, useInvoices } from '@/features/invoices/hooks';
import { QueryState } from '@/components/shared/QueryState';

const columns: Column<Invoice>[] = [
    {
        key: 'id',
        header: 'Invoice',
        render: (value) => (
            <Link href={`/invoices/${value}`} className="font-medium text-primary hover:underline">
                {value}
            </Link>
        ),
    },
    {
        key: 'client',
        header: 'Client',
    },
    {
        key: 'date',
        header: 'Date',
        className: 'text-muted-foreground',
        render: (value) => formatDate(value),
    },
    {
        key: 'amount',
        header: 'Amount',
        className: 'text-right tabular-nums',
        render: (value) => formatCurrency(value),
    },
    {
        key: 'status',
        header: 'Status',
        render: (value) => <InvoiceStatusBadge status={value} />,
    },
];

export function InvoiceTable() {
    const { data: invoices = [], isPending, error, refetch } = useInvoices();
    useInvoiceEvents();

    return (
        <QueryState
            isPending={isPending}
            error={error}
            onRetry={() => void refetch()}
            isEmpty={!invoices.length}
            emptyMessage="No invoices yet"
        >
            <DataTable
                columns={columns}
                data={invoices}
                renderActions={(invoice) => <InvoiceActions invoice={invoice} />}
            />
        </QueryState>
    );
}
