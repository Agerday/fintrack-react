import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Prefetched } from '@/components/shared/Prefetched';
import { InvoiceDetail } from '@/features/invoices/components/InvoiceDetail';
import { findInvoice } from '@/features/invoices/queries';

// The tab title depends on the URL: generateMetadata instead of a static metadata object
export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    return { title: `Invoice ${id}` };
}

// Server Component: the invoice is read on the server and streams in already loaded. An unknown
// id is not prefetched: InvoiceDetail fetches it and shows the 404
export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <div className="mx-auto max-w-3xl space-y-6 lg:space-y-8">
            <Link
                href="/invoices"
                className={buttonVariants({ variant: 'ghost', className: '-ml-2.5' })}
            >
                <ArrowLeft />
                Back to invoices
            </Link>

            <PageHeader title={`Invoice ${id}`} description="Invoice details." />

            <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
                <Prefetched
                    queries={[{ queryKey: ['invoice', id], queryFn: () => findInvoice(id) }]}
                >
                    <InvoiceDetail id={id} />
                </Prefetched>
            </Suspense>
        </div>
    );
}
