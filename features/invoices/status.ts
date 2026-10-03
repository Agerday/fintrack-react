import type { InvoiceStatus } from './types';

// Single source of truth for how a status is shown (badge, charts, legends)
export const statusLabels: Record<InvoiceStatus, string> = {
    paid: 'Paid',
    pending: 'Pending',
    overdue: 'Overdue',
};

// CSS variable names, for canvas charts that can't read Tailwind classes (see cssVar)
export const statusColorTokens: Record<InvoiceStatus, string> = {
    paid: '--status-paid',
    pending: '--status-pending',
    overdue: '--destructive',
};

// Same colors as Tailwind background classes, for HTML legends
export const statusDotClasses: Record<InvoiceStatus, string> = {
    paid: 'bg-status-paid',
    pending: 'bg-status-pending',
    overdue: 'bg-destructive',
};
