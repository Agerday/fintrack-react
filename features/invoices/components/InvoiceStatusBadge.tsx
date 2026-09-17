import type { InvoiceStatus } from '../types';

type InvoiceStatusBadgeProps = {
  status: InvoiceStatus;
};

const statusStyles: Record<InvoiceStatus, string> = {
  paid: 'bg-green-50 text-green-700 ring-green-600/20',
  pending: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
  overdue: 'bg-red-50 text-red-700 ring-red-600/20',
};

const statusLabels: Record<InvoiceStatus, string> = {
  paid: 'Paid',
  pending: 'Pending',
  overdue: 'Overdue',
};

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
