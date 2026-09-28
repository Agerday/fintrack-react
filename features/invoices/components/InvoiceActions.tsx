'use client';

import { Check, Trash2 } from 'lucide-react';
import type { Invoice } from '../types';
import { useDeleteInvoice, useUpdateInvoice } from '@/features/invoices/hooks';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { cn } from '@/lib/utils';

type InvoiceActionsProps = {
    invoice: Pick<Invoice, 'id' | 'status'>;
    // compact = icon buttons for table rows, full = labeled buttons for the detail page
    variant?: 'compact' | 'full';
    onDeleted?: () => void;
};

// "Mark as paid" + "Delete" (with confirmation). Each instance owns its mutations,
// so the pending state is per row instead of shared by the whole table
export function InvoiceActions({ invoice, variant = 'compact', onDeleted }: InvoiceActionsProps) {
    const { mutate: markAsPaid, isPending: isUpdating } = useUpdateInvoice();
    const { mutate: deleteInvoice, isPending: isDeleting } = useDeleteInvoice();
    const compact = variant === 'compact';

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
                    onClick={() => markAsPaid({ id: invoice.id, data: { status: 'paid' } })}
                >
                    <Check />
                    {!compact && 'Mark as paid'}
                </Button>
            )}

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
        </div>
    );
}
