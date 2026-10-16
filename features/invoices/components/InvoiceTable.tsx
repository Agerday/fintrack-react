'use client';

import Link from 'next/link';
import type { Invoice } from '../types';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { InvoiceActions } from './InvoiceActions';
import { type Column, DataTable } from '@/components/ui/DataTable';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { useInvoiceEvents, useInvoices } from '@/features/invoices/hooks';
import { ConnectionBadge } from '@/components/shared/ConnectionBadge';
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
    const status = useInvoiceEvents();

    return (
        <div className="space-y-3">
            {/* Changes made in other tabs show up here while it says "Live" */}
            <div className="flex justify-end">
                <ConnectionBadge status={status} />
            </div>
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
        </div>
    );
}
