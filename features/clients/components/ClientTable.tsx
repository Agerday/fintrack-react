'use client';

import type { Client } from '@/features/clients/types';
import { type Column, DataTable } from '@/components/ui/DataTable';
import { formatCurrency } from '@/lib/formatters';
import { QueryState } from '@/components/shared/QueryState';
import { useClients } from '@/features/clients/hooks';
import { clientListHref, clientSortHref, queryClients } from '@/features/clients/rules';
import {
    type ClientListParams,
    type ClientSortKey,
    defaultClientListParams,
} from '@/features/clients/schema';
import { Pagination } from '@/components/shared/Pagination';
import { SearchForm } from '@/components/shared/SearchForm';
import { changedParams } from '@/lib/list-params';

const columns: Column<Client>[] = [
    {
        key: 'name',
        header: 'Client',
        // Name + email in one cell: the email is secondary info, no need for its own column.
        // A client only known from its invoices has no contact details yet
        render: (value, client) => (
            <div className="min-w-0">
                <p className="font-medium">{value}</p>
                <p className="truncate text-xs font-normal text-muted-foreground">
                    {client.email || 'No contact details'}
                </p>
            </div>
        ),
        sortable: true,
    },
    {
        key: 'company',
        header: 'Company',
        render: (value) => value || '—',
    },
    {
        key: 'phone',
        header: 'Phone',
        className: 'text-muted-foreground tabular-nums',
        render: (value) => value || '—',
    },
    {
        key: 'invoices',
        header: 'Invoices',
        className: 'text-right tabular-nums',
        sortable: true,
    },
    {
        key: 'total',
        header: 'Total',
        className: 'text-right font-medium tabular-nums',
        render: (value) => formatCurrency(value),
        sortable: true,
    },
];

type ClientTableProps = {
    // Read from the URL by the page
    params: ClientListParams;
};

export function ClientTable({ params }: ClientTableProps) {
    const { data: clients = [], isLoading, error, refetch } = useClients();
    const shown = queryClients(clients, params);
    // Not the page: a new search starts on page 1
    const keep = changedParams({ ...params, q: '', page: 1 }, defaultClientListParams);

    return (
        <div className="space-y-3">
            <div className="sm:max-w-xs">
                <SearchForm
                    action="/clients"
                    label="Search clients"
                    defaultValue={params.q}
                    keep={keep}
                />
            </div>
            <QueryState
                isPending={isLoading}
                error={error}
                onRetry={() => void refetch()}
                isEmpty={!shown.items.length}
                emptyMessage={clients.length ? 'No clients match your search' : 'No clients yet'}
            >
                <DataTable
                    columns={columns}
                    data={shown.items}
                    rowKey="id"
                    sort={{
                        key: params.sort,
                        dir: params.dir,
                        // Only the sortable columns get a link, and they are all sort keys
                        href: (key) => clientSortHref(params, key as ClientSortKey),
                    }}
                />
                <Pagination
                    page={shown.page}
                    pageCount={shown.pageCount}
                    href={(page) => clientListHref(params, { page })}
                />
            </QueryState>
        </div>
    );
}
