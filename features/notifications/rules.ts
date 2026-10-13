import type { InvoiceEvent } from '@/features/invoices/types';
import type { NewNotification } from './types';

export type InvoiceEventType = InvoiceEvent['type'];

// One switch per event type, all on by default
export type NotificationPreferences = Record<InvoiceEventType, boolean>;

export const defaultNotificationPreferences: NotificationPreferences = {
    'invoice.created': true,
    'invoice.updated': true,
    'invoice.deleted': true,
};

// Only called for events from another tab: this tab's own changes need no alert
export function invoiceEventNotification(
    event: InvoiceEvent,
    preferences: NotificationPreferences,
): NewNotification | null {
    if (!preferences[event.type]) return null;

    switch (event.type) {
        case 'invoice.created':
            return {
                type: 'info',
                title: `Invoice ${event.id} created`,
                href: `/invoices/${event.id}`,
            };
        case 'invoice.updated':
            return {
                type: 'info',
                title: `Invoice ${event.id} updated`,
                href: `/invoices/${event.id}`,
            };
        case 'invoice.deleted':
            // No link: the invoice is gone
            return { type: 'warning', title: `Invoice ${event.id} deleted` };
    }
}
