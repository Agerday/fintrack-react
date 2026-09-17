import type { Invoice } from '../types';

import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { Column, DataTable } from '@/components/ui/DataTable';
import { formatCurrency } from '@/lib/formatters';
import { invoices } from '@/features/invoices/data';

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
    return <DataTable columns={columns} data={invoices} />;
}
