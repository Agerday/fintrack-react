import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Prefetched } from '@/components/shared/Prefetched';
import { ListSkeleton } from '@/components/shared/QueryState';
import { ClientTable } from '@/features/clients/components/ClientTable';
import { CreateClientDialog } from '@/features/clients/components/CreateClientDialog';
import { listClients } from '@/features/clients/queries';
import { parseClientListParams } from '@/features/clients/schema';

// The header is sent at once; the table streams in with its data already loaded.
// Search, sort and page come from the URL, like the invoices page
export default async function ClientsPage({ searchParams }: PageProps<'/clients'>) {
    const params = parseClientListParams(await searchParams);

    return (
        <div className="space-y-6 lg:space-y-8">
            <PageHeader
                title="Clients"
                description="Manage your clients and their billing information."
                action={<CreateClientDialog />}
            />

            <Suspense fallback={<ListSkeleton />}>
                <Prefetched queries={[{ queryKey: ['clients'], queryFn: listClients }]}>
                    <ClientTable params={params} />
                </Prefetched>
            </Suspense>
        </div>
    );
}
