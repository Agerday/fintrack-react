import type { InvoiceStatus } from '../types';
import { cn } from '@/lib/utils';

type InvoiceStatusBadgeProps = {
    status: InvoiceStatus;
};

const statusStyles: Record<InvoiceStatus, string> = {
    paid: 'bg-status-paid/10 text-status-paid ring-status-paid/20',
    pending: 'bg-status-pending/10 text-status-pending ring-status-pending/25',
    overdue: 'bg-destructive/10 text-destructive ring-destructive/20',
};

const statusLabels: Record<InvoiceStatus, string> = {
    paid: 'Paid',
    pending: 'Pending',
    overdue: 'Overdue',
};

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
                statusStyles[status],
            )}
        >
            {/* The dot takes the text color, so it matches each status without extra classes */}
            <span className="size-1.5 rounded-full bg-current" />
            {statusLabels[status]}
        </span>
    );
}
