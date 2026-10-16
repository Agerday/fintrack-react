'use client';

import { InvoiceForm } from './InvoiceForm';
import { FormDialog } from '@/components/shared/FormDialog';

// Its own Client Component: FormDialog takes a function as children, which can't cross the
// Server -> Client boundary. The page around it stays a Server Component
export function CreateInvoiceDialog() {
    return (
        <FormDialog title="Create invoice" triggerLabel="New invoice" hotkey="n">
            {(close) => <InvoiceForm onSuccess={close} />}
        </FormDialog>
    );
}
