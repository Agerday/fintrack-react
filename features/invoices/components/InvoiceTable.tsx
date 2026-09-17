import type { Invoice } from '../types';

import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { Column, DataTable } from '@/components/ui/DataTable';

const invoices: Invoice[] = [
    {
        id: 'INV-001',
        client: 'Acme Corporation',
        date: 'Sep 12, 2026',
        amount: 2400,
        status: 'paid',
    },
    {
        id: 'INV-002',
        client: 'Globex Inc.',
        date: 'Sep 10, 2026',
        amount: 1850,
        status: 'pending',
    },
    {
        id: 'INV-003',
        client: 'Soylent Corp.',
        date: 'Sep 08, 2026',
        amount: 320,
        status: 'paid',
    },
    {
        id: 'INV-004',
        client: 'Initech',
        date: 'Sep 02, 2026',
        amount: 980,
        status: 'overdue',
    },
];

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
    },
    {
        key: 'status',
        header: 'Status',
        render: (value: string) => <InvoiceStatusBadge status={value as Invoice['status']} />,
        //Using special html rendering for our Badge.
    },
];

export function InvoiceTable() {
    return <DataTable columns={columns} data={invoices} />;
}
