import { InvoiceTable } from '@/features/invoices/components/InvoiceTable';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';

export default function InvoicesPage() {
    return (
        <div className="space-y-8">
            <PageHeader
                title="Invoices"
                description="Manage and track your invoices."
                action={<Button>Create invoice</Button>}
            />

            <InvoiceTable />
        </div>
    );
}
