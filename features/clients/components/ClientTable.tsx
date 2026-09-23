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
    const { data: clients = [], isLoading, error } = useClients();

    return (
        <QueryState isPending={isLoading} error={error} isEmpty={!clients.length}>
            <div className="rounded-xl border bg-card card-elevated">
                <DataTable columns={columns} data={clients} />
            </div>
        </QueryState>
    );
}
