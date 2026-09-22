'use client';

import { Client } from '@/features/clients/types';
import { Column, DataTable } from '@/components/ui/DataTable';
import { formatCurrency } from '@/lib/formatters';
import { QueryState } from '@/components/shared/QueryState';
import { useClients } from '@/features/clients/hooks';

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
    const { data: clients = [], isLoading, isError } = useClients();

    return (
        <QueryState isPending={isLoading} isError={isError} isEmpty={!clients.length}>
            <DataTable columns={columns} data={clients} />
        </QueryState>
    );
}
