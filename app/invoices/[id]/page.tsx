import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { buttonVariants } from '@/components/ui/button';
import { InvoiceDetail } from '@/features/invoices/components/InvoiceDetail';

// Server Component: only reads the route param, the client-side fetching lives in InvoiceDetail
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

            <InvoiceDetail id={id} />
        </div>
    );
}
