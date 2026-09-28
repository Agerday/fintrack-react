'use client';

import { ClientTable } from '@/features/clients/components/ClientTable';
import { ClientForm } from '@/features/clients/components/ClientForm';
import { PageHeader } from '@/components/layout/PageHeader';
import { FormDialog } from '@/components/shared/FormDialog';

// Stays a Client Component: FormDialog takes a function as children, which can't cross
// the Server -> Client boundary (only serializable props can)
export default function ClientsPage() {
    return (
        <div className="space-y-6 lg:space-y-8">
            <PageHeader
                title="Clients"
                description="Manage your clients and their billing information."
                action={
                    <FormDialog title="Create client" triggerLabel="New client" hotkey="n">
                        {(close) => <ClientForm onSuccess={close} />}
                    </FormDialog>
                }
            />

            <ClientTable />
        </div>
    );
}
