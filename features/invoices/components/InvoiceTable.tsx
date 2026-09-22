'use client';

import type { Invoice } from '../types';

import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { Column, DataTable } from '@/components/ui/DataTable';
import { formatCurrency } from '@/lib/formatters';
import { useInvoices } from '@/features/invoices/hooks';
import { QueryState } from '@/components/shared/QueryState';

const columns: Column<Invoice>[] = [
    {
        key: 'id',
        header: 'Invoice',
    },
    {
        key: 'client',
        header: 'Client',
    },
    {
        key: 'date',
        header: 'Date',
    },
    {
        key: 'amount',
        header: 'Amount',
        render: (value) => formatCurrency(value),
    },
    {
        key: 'status',
        header: 'Status',
        render: (value: string) => <InvoiceStatusBadge status={value as Invoice['status']} />,
    },
];

export function InvoiceTable() {
    const { data: invoices = [], isPending, error } = useInvoices();

    return (
        <QueryState isPending={isPending} error={error} isEmpty={!invoices.length}>
            <DataTable columns={columns} data={invoices} />
        </QueryState>
    );
}
