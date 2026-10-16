import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Prefetched } from '@/components/shared/Prefetched';
import { ListSkeleton } from '@/components/shared/QueryState';
import { CreateInvoiceDialog } from '@/features/invoices/components/CreateInvoiceDialog';
import { InvoiceTable } from '@/features/invoices/components/InvoiceTable';
import { listInvoices } from '@/features/invoices/queries';

// The header is sent at once; the table streams in with its data already loaded
export default function InvoicesPage() {
    return (
        <div className="space-y-6 lg:space-y-8">
            <PageHeader
                title="Invoices"
                description="Manage and track your invoices."
                action={<CreateInvoiceDialog />}
            />

            <Suspense fallback={<ListSkeleton />}>
                <Prefetched queries={[{ queryKey: ['invoices'], queryFn: listInvoices }]}>
                    <InvoiceTable />
                </Prefetched>
            </Suspense>
        </div>
    );
}
