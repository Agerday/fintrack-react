'use client';

import { InvoiceTable } from '@/features/invoices/components/InvoiceTable';
import { InvoiceForm } from '@/features/invoices/components/InvoiceForm';
import { PageHeader } from '@/components/layout/PageHeader';
import { FormDialog } from '@/components/shared/FormDialog';

// Stays a Client Component: FormDialog takes a function as children, which can't cross
// the Server -> Client boundary (only serializable props can)
export default function InvoicesPage() {
    return (
        <div className="space-y-6 lg:space-y-8">
            <PageHeader
                title="Invoices"
                description="Manage and track your invoices."
                action={
                    <FormDialog title="Create invoice" triggerLabel="New invoice" hotkey="n">
                        {(close) => <InvoiceForm onSuccess={close} />}
                    </FormDialog>
                }
            />

            <InvoiceTable />
        </div>
    );
}
