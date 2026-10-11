'use client';

import { Check, Trash2 } from 'lucide-react';
import type { Invoice } from '../types';
import { useDeleteInvoice, useUpdateInvoice } from '@/features/invoices/hooks';
import { canDeleteInvoice } from '@/features/invoices/rules';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useNotificationStore } from '@/lib/store/useNotificationStore';
import { cn } from '@/lib/utils';

type InvoiceActionsProps = {
    invoice: Pick<Invoice, 'id' | 'status'>;
    // compact = icon buttons for table rows, full = labeled buttons for the detail page
    variant?: 'compact' | 'full';
    onDeleted?: () => void;
};

// "Mark as paid" + "Delete" (with confirmation), both only on unpaid invoices. Each instance
// owns its mutations, so the pending state is per row instead of shared by the whole table
export function InvoiceActions({ invoice, variant = 'compact', onDeleted }: InvoiceActionsProps) {
    const { mutate: markAsPaid, isPending: isUpdating } = useUpdateInvoice();
    const { mutate: deleteInvoice, isPending: isDeleting } = useDeleteInvoice();
    const notify = useNotificationStore((state) => state.add);
    const compact = variant === 'compact';

    // A table row has no room for an error message: the failure goes to the notification bell
    function reportFailure(title: string) {
        return (error: Error) => notify({ type: 'error', title, message: error.message });
    }

    return (
        <div className={cn('flex items-center justify-end gap-1', !compact && 'gap-2')}>
            {invoice.status !== 'paid' && (
                <Button
                    variant={compact ? 'ghost' : 'outline'}
                    size={compact ? 'icon-sm' : 'lg'}
                    disabled={isUpdating}
                    aria-label="Mark as paid"
                    title="Mark as paid"
                    className={cn(!compact && 'flex-1 sm:flex-none')}
                    onClick={() =>
                        markAsPaid(
                            { id: invoice.id, data: { status: 'paid' } },
                            { onError: reportFailure(`Could not mark ${invoice.id} as paid`) },
                        )
                    }
                >
                    <Check />
                    {!compact && 'Mark as paid'}
                </Button>
            )}

            {canDeleteInvoice(invoice.status) && (
                <ConfirmDialog
                    title={`Delete invoice ${invoice.id}?`}
                    description="This action cannot be undone."
                    isPending={isDeleting}
                    onConfirm={(close) =>
                        deleteInvoice(invoice.id, {
                            onSuccess: () => {
                                close();
                                onDeleted?.();
                            },
                            onError: (error) => {
                                close();
                                reportFailure(`Could not delete ${invoice.id}`)(error);
                            },
                        })
                    }
                    trigger={
                        <Button
                            variant={compact ? 'ghost' : 'destructive'}
                            size={compact ? 'icon-sm' : 'lg'}
                            aria-label="Delete invoice"
                            title="Delete invoice"
                            className={cn(
                                compact && 'text-muted-foreground hover:text-destructive',
                                !compact && 'flex-1 sm:flex-none',
                            )}
                        >
                            <Trash2 />
                            {!compact && 'Delete'}
                        </Button>
                    }
                />
            )}
        </div>
    );
}
