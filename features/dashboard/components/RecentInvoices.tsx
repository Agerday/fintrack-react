import Link from 'next/link';
import { ArrowUpRight, FileText } from 'lucide-react';
import type { Invoice } from '@/features/invoices/types';
import { InvoiceStatusBadge } from '@/features/invoices/components/InvoiceStatusBadge';
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatCurrency } from '@/lib/formatters';

type RecentInvoicesProps = {
    invoices: Pick<Invoice, 'id' | 'client' | 'amount' | 'status'>[];
};

export function RecentInvoices({ invoices }: RecentInvoicesProps) {
    return (
        <Card className="gap-0 pb-0">
            <CardHeader className="border-b">
                <CardTitle>Recent invoices</CardTitle>
                <CardDescription>Your latest invoices</CardDescription>
                <CardAction>
                    <Link href="/invoices" className={buttonVariants({ variant: 'ghost' })}>
                        View all
                        <ArrowUpRight />
                    </Link>
                </CardAction>
            </CardHeader>

            {invoices.length ? (
                <ul className="divide-y">
                    {invoices.map((invoice) => (
                        <li key={invoice.id}>
                            <Link
                                href={`/invoices/${invoice.id}`}
                                className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/50"
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">{invoice.id}</p>
                                    <p className="truncate text-sm text-muted-foreground">
                                        {invoice.client}
                                    </p>
                                </div>

                                {/* Amount above the badge on mobile, side by side from sm up */}
                                <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-6">
                                    <span className="text-sm font-medium tabular-nums">
                                        {formatCurrency(invoice.amount)}
                                    </span>
                                    <InvoiceStatusBadge status={invoice.status} />
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <EmptyState icon={FileText} title="No invoices yet" className="m-4 border-none" />
            )}
        </Card>
    );
}
