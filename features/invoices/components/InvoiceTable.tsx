'use client';

import type { Invoice } from '../types';

import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { Column, DataTable } from '@/components/ui/DataTable';
import { formatCurrency, formatDate } from '@/lib/formatters';
import {
    useDeleteInvoice,
    useInvoiceEvents,
    useInvoices,
    useUpdateInvoice,
} from '@/features/invoices/hooks';
import { QueryState } from '@/components/shared/QueryState';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const columns: Column<Invoice>[] = [
    {
        key: 'id',
        header: 'Invoice',
        render: (value) => (
            <Link href={`/invoices/${value}`} className="text-primary hover:underline">
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
        render: (value) => formatDate(value),
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
    useInvoiceEvents();
    const { mutate: markAsPaid } = useUpdateInvoice();
    const { mutate: deleteInvoice } = useDeleteInvoice();

    return (
        <QueryState isPending={isPending} error={error} isEmpty={!invoices.length}>
            <div className="rounded-xl border bg-card card-elevated">
                <DataTable
                    columns={columns}
                    data={invoices}
                    renderActions={(invoice) => (
                        <div className="flex gap-2">
                            <Button
                                size={'sm'}
                                variant={'destructive'}
                                onClick={() => deleteInvoice(invoice.id)}
                            >
                                X
                            </Button>
                            {invoice.status !== 'paid' && (
                                <Button
                                    size={'sm'}
                                    variant={'outline'}
                                    onClick={() =>
                                        markAsPaid({ id: invoice.id, data: { status: 'paid' } })
                                    }
                                >
                                    Mark As Paid
                                </Button>
                            )}
                        </div>
                    )}
                />
            </div>
        </QueryState>
    );
}
