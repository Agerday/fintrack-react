import { Client } from '@/features/clients/types';
import { Column, DataTable } from '@/components/ui/DataTable';
import { formatCurrency } from '@/lib/formatters';

const clients: Client[] = [
    {
        id: '1',
        name: 'Acme Corporation',
        email: 'billing@acme.com',
        invoices: 12,
        total: 18400,
    },
    {
        id: '2',
        name: 'Globex Inc.',
        email: 'finance@globex.com',
        invoices: 8,
        total: 11250,
    },
    {
        id: '3',
        name: 'Soylent Corp.',
        email: 'accounts@soylent.com',
        invoices: 6,
        total: 9800,
    },
    {
        id: '4',
        name: 'Initech',
        email: 'billing@initech.com',
        invoices: 4,
        total: 4200,
    },
];

const columns: Column<Client>[] = [
    {
        key: 'id',
        header: 'Client',
    },
    {
        key: 'name',
        header: 'Name',
    },
    {
        key: 'email',
        header: 'Email',
    },
    {
        key: 'invoices',
        header: 'Invoices',
    },
    {
        key: 'total',
        header: 'Total',
        render: (value) => formatCurrency(value),
    },
];

export function ClientTable() {
    return <DataTable data={clients} columns={columns} />;
}
