'use client';

import { ClientTable } from '@/features/clients/components/ClientTable';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import { ClientForm } from '@/features/clients/components/ClientForm';

export default function ClientsPage() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'n' && !event.metaKey && !event.ctrlKey) {
                event.preventDefault();
                setOpen(true);
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="space-y-8">
            <PageHeader
                title="Clients"
                description="Manage your clients and their billing information."
                action={
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger render={<Button> Create Client (N)</Button>} />
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Client</DialogTitle>
                            </DialogHeader>
                            <ClientForm onSuccess={() => setOpen(false)} />
                        </DialogContent>
                    </Dialog>
                }
            />

            <ClientTable />
        </div>
    );
}
