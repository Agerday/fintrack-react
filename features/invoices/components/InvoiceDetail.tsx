'use client';

import { useRouter } from 'next/navigation';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { InvoiceActions } from './InvoiceActions';
import { useInvoice, useInvoiceEvents } from '@/features/invoices/hooks';
import { QueryState } from '@/components/shared/QueryState';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/formatters';

type InvoiceDetailProps = {
    id: string;
};

export function InvoiceDetail({ id }: InvoiceDetailProps) {
    const router = useRouter();
    const { data: invoice, isPending, error, refetch } = useInvoice(id);
    useInvoiceEvents();

    return (
        <QueryState
            isPending={isPending}
            error={error}
            onRetry={() => void refetch()}
            loadingFallback={<Skeleton className="h-64 w-full rounded-xl" />}
        >
            {invoice && (
                <Card className="gap-0 py-0">
                    <CardContent className="p-5 sm:p-6">
                        {/* The id is already the page title, the card leads with the amount */}
                        <div className="flex items-center justify-between gap-4">
                            <p className="text-sm text-muted-foreground">Amount</p>
                            <InvoiceStatusBadge status={invoice.status} />
                        </div>

                        <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
                            {formatCurrency(invoice.amount)}
                        </p>

                        <dl className="mt-6 grid gap-4 border-t pt-6 sm:grid-cols-2">
                            <div>
                                <dt className="text-sm text-muted-foreground">Client</dt>
                                <dd className="mt-1 font-medium">{invoice.client}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">Issued on</dt>
                                <dd className="mt-1 font-medium">{formatDate(invoice.date)}</dd>
                            </div>
                        </dl>
                    </CardContent>

                    <CardFooter className="justify-end p-4 sm:px-6">
                        <div className="w-full sm:w-auto">
                            <InvoiceActions
                                invoice={invoice}
                                variant="full"
                                onDeleted={() => router.push('/invoices')}
                            />
                        </div>
                    </CardFooter>
                </Card>
            )}
        </QueryState>
    );
}
