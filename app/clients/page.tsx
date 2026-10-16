import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Prefetched } from '@/components/shared/Prefetched';
import { ListSkeleton } from '@/components/shared/QueryState';
import { ClientTable } from '@/features/clients/components/ClientTable';
import { CreateClientDialog } from '@/features/clients/components/CreateClientDialog';
import { listClients } from '@/features/clients/queries';

// The header is sent at once; the table streams in with its data already loaded
export default function ClientsPage() {
    return (
        <div className="space-y-6 lg:space-y-8">
            <PageHeader
                title="Clients"
                description="Manage your clients and their billing information."
                action={<CreateClientDialog />}
            />

            <Suspense fallback={<ListSkeleton />}>
                <Prefetched queries={[{ queryKey: ['clients'], queryFn: listClients }]}>
                    <ClientTable />
                </Prefetched>
            </Suspense>
        </div>
    );
}
