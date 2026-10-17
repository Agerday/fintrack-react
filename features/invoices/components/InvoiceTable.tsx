'use client';

import Link from 'next/link';
import type { Invoice } from '../types';
import { queryInvoices } from '../rules';
import { defaultInvoiceListParams, type InvoiceListParams } from '../schema';
import { InvoiceStatusFilter } from './InvoiceStatusFilter';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { InvoiceActions } from './InvoiceActions';
import { type Column, DataTable } from '@/components/ui/DataTable';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { useInvoiceEvents, useInvoices, useOptimisticPayment } from '@/features/invoices/hooks';
import { ConnectionBadge } from '@/components/shared/ConnectionBadge';
import { QueryState } from '@/components/shared/QueryState';
import { SearchForm } from '@/components/shared/SearchForm';
import { changedParams } from '@/lib/list-params';

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

type InvoiceTableProps = {
    // Read from the URL by the page
    params: InvoiceListParams;
};

export function InvoiceTable({ params }: InvoiceTableProps) {
    const { data = [], isPending, error, refetch } = useInvoices();
    const { invoices, markAsPaid } = useOptimisticPayment(data);
    const status = useInvoiceEvents();
    const shown = queryInvoices(invoices, params);
    // The search field sends q itself, the other changed params ride along as hidden inputs
    const keep = changedParams({ ...params, q: '' }, defaultInvoiceListParams);

    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="sm:max-w-xs sm:flex-1">
                    <SearchForm
                        action="/invoices"
                        label="Search invoices"
                        defaultValue={params.q}
                        keep={keep}
                    />
                </div>
                <InvoiceStatusFilter params={params} />
                {/* Changes made in other tabs show up here while it says "Live" */}
                <div className="sm:ml-auto">
                    <ConnectionBadge status={status} />
                </div>
            </div>
            <QueryState
                isPending={isPending}
                error={error}
                onRetry={() => void refetch()}
                isEmpty={!shown.length}
                emptyMessage={invoices.length ? 'No invoices match your search' : 'No invoices yet'}
            >
                <DataTable
                    columns={columns}
                    data={shown}
                    renderActions={(invoice) => (
                        <InvoiceActions
                            invoice={invoice}
                            onMarkAsPaid={() => markAsPaid(invoice.id)}
                        />
                    )}
                />
            </QueryState>
        </div>
    );
}
