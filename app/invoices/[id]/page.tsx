import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { buttonVariants } from '@/components/ui/button';
import { InvoiceDetail } from '@/features/invoices/components/InvoiceDetail';

// Server Component: only reads the route param, the client-side fetching lives in InvoiceDetail
export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <div className="space-y-8">
            <PageHeader
                title={`Invoice ${id}`}
                description="Invoice details."
                action={
                    <Link href="/invoices" className={buttonVariants({ variant: 'outline' })}>
                        Back to invoices
                    </Link>
                }
            />

            <InvoiceDetail id={id} />
        </div>
    );
}
