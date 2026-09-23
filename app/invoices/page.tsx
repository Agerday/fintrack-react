'use client';

import { InvoiceTable } from '@/features/invoices/components/InvoiceTable';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { InvoiceForm } from '@/features/invoices/components/InvoiceForm';
import { useEffect, useState } from 'react';

export default function InvoicesPage() {
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
                title="Invoices"
                description="Manage and track your invoices."
                action={
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger render={<Button> Create Invoice (N)</Button>} />
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create invoice</DialogTitle>
                            </DialogHeader>
                            <InvoiceForm onSuccess={() => setOpen(false)} />
                        </DialogContent>
                    </Dialog>
                }
            />

            <InvoiceTable />
        </div>
    );
}
