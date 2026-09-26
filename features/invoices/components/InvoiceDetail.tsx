'use client';

import { useRouter } from 'next/navigation';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import {
    useDeleteInvoice,
    useInvoice,
    useInvoiceEvents,
    useUpdateInvoice,
} from '@/features/invoices/hooks';
import { QueryState } from '@/components/shared/QueryState';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/formatters';

type InvoiceDetailProps = {
    id: string;
};

export function InvoiceDetail({ id }: InvoiceDetailProps) {
    const router = useRouter();
    const { data: invoice, isPending, error } = useInvoice(id);
    useInvoiceEvents();
    const { mutate: markAsPaid, isPending: isUpdating } = useUpdateInvoice();
    const { mutate: deleteInvoice, isPending: isDeleting } = useDeleteInvoice();

    function handleDelete() {
        deleteInvoice(id, { onSuccess: () => router.push('/invoices') });
    }

    return (
        <QueryState isPending={isPending} error={error}>
            {invoice && (
                <div className="card-elevated rounded-xl border bg-card p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Invoice</p>
                            <p className="text-lg font-semibold">{invoice.id}</p>
                        </div>
                        <InvoiceStatusBadge status={invoice.status} />
                    </div>

                    <dl className="mt-6 grid gap-6 sm:grid-cols-3">
                        <div>
                            <dt className="text-sm text-muted-foreground">Client</dt>
                            <dd className="mt-1 font-medium">{invoice.client}</dd>
                        </div>
                        <div>
                            <dt className="text-sm text-muted-foreground">Date</dt>
                            <dd className="mt-1 font-medium">{formatDate(invoice.date)}</dd>
                        </div>
                        <div>
                            <dt className="text-sm text-muted-foreground">Amount</dt>
                            <dd className="mt-1 font-medium">{formatCurrency(invoice.amount)}</dd>
                        </div>
                    </dl>

                    <div className="mt-8 flex justify-end gap-2">
                        {invoice.status !== 'paid' && (
                            <Button
                                variant={'outline'}
                                disabled={isUpdating}
                                onClick={() => markAsPaid({ id, data: { status: 'paid' } })}
                            >
                                Mark As Paid
                            </Button>
                        )}
                        <Button
                            variant={'destructive'}
                            disabled={isDeleting}
                            onClick={handleDelete}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </div>
                </div>
            )}
        </QueryState>
    );
}
