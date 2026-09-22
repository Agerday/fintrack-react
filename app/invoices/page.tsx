import { InvoiceTable } from '@/features/invoices/components/InvoiceTable';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTrigger,
    DialogTitle,
} from '@/components/ui/dialog';
import { InvoiceForm } from '@/features/invoices/components/InvoiceForm';

export default function InvoicesPage() {
    return (
        <div className="space-y-8">
            <PageHeader
                title="Invoices"
                description="Manage and track your invoices."
                action={
                    <Dialog>
                        <DialogTrigger render={<Button> Create Invoice </Button>} />
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create invoice</DialogTitle>
                            </DialogHeader>
                            <InvoiceForm />
                        </DialogContent>
                    </Dialog>
                }
            />

            <InvoiceTable />
        </div>
    );
}
