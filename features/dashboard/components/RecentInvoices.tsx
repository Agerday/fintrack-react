import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Invoice } from '@/features/invoices/types';
import { InvoiceStatusBadge } from '@/features/invoices/components/InvoiceStatusBadge';

type RecentInvoicesProps = {
    invoices: Pick<Invoice, 'id' | 'client' | 'amount' | 'status'>[];
};

export function RecentInvoices({ invoices }: RecentInvoicesProps) {
    return (
        <div className="rounded-xl border bg-white">
            <div className="flex items-center justify-between border-b px-6 py-4">
                <div>
                    <h2 className="font-semibold">Recent invoices</h2>
                    <p className="text-sm text-slate-500">Your latest invoices</p>
                </div>

                <Link
                    href="/invoices"
                    className="flex items-center gap-1 text-sm font-medium text-slate-900 hover:underline"
                >
                    View all
                    <ArrowUpRight className="h-4 w-4" />
                </Link>
            </div>

            <div className="divide-y">
                {invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between px-6 py-4">
                        <div>
                            <p className="text-sm font-medium">{invoice.id}</p>
                            <p className="text-sm text-slate-500">{invoice.client}</p>
                        </div>

                        <div className="flex items-center gap-8">
                            <span className="text-sm font-medium">{invoice.amount}</span>
                            <InvoiceStatusBadge status={invoice.status} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
