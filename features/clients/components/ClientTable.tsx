'use client';

import { Client } from '@/features/clients/types';
import { Column, DataTable } from '@/components/ui/DataTable';
import { formatCurrency } from '@/lib/formatters';
import { QueryState } from '@/components/shared/QueryState';
import { useClients } from '@/features/clients/hooks';

const columns: Column<Client>[] = [
    {
        key: 'name',
        header: 'Client',
        // Name + email in one cell: the email is secondary info, no need for its own column
        render: (value, client) => (
            <div className="min-w-0">
                <p className="font-medium">{value}</p>
                <p className="truncate text-xs font-normal text-muted-foreground">{client.email}</p>
            </div>
        ),
    },
    {
        key: 'company',
        header: 'Company',
    },
    {
        key: 'phone',
        header: 'Phone',
        className: 'text-muted-foreground tabular-nums',
    },
    {
        key: 'invoices',
        header: 'Invoices',
        className: 'text-right tabular-nums',
    },
    {
        key: 'total',
        header: 'Total',
        className: 'text-right font-medium tabular-nums',
        render: (value) => formatCurrency(value),
    },
];

export function ClientTable() {
    const { data: clients = [], isLoading, error, refetch } = useClients();

    return (
        <QueryState
            isPending={isLoading}
            error={error}
            onRetry={() => void refetch()}
            isEmpty={!clients.length}
            emptyMessage="No clients yet"
        >
            <DataTable columns={columns} data={clients} rowKey="id" />
        </QueryState>
    );
}
