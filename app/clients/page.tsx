import { ClientTable } from '@/features/clients/components/ClientTable';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';

export default function ClientsPage() {
    return (
        <div className="space-y-8">
            <PageHeader
                title="Clients"
                description="Manage your clients and their billing information."
                action={<Button>Add client</Button>}
            />

            <ClientTable />
        </div>
    );
}
