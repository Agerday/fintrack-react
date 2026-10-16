'use client';

import { ClientForm } from './ClientForm';
import { FormDialog } from '@/components/shared/FormDialog';

// Its own Client Component: FormDialog takes a function as children, which can't cross the
// Server -> Client boundary. The page around it stays a Server Component
export function CreateClientDialog() {
    return (
        <FormDialog title="Create client" triggerLabel="New client" hotkey="n">
            {(close) => <ClientForm onSuccess={close} />}
        </FormDialog>
    );
}
