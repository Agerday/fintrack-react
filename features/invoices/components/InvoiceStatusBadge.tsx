import type { InvoiceStatus } from '../types';

type InvoiceStatusBadgeProps = {
    status: InvoiceStatus;
};

const statusStyles: Record<InvoiceStatus, string> = {
    paid: 'bg-status-paid/10 text-status-paid ring-status-paid/20',
    pending: 'bg-status-pending/10 text-status-pending ring-status-pending/20',
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
            className={`inline-flex w-20 items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[status]}`}
        >
            {statusLabels[status]}
        </span>
    );
}
