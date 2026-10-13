import { describe, expect, it } from 'vitest';
import { defaultNotificationPreferences, invoiceEventNotification } from './rules';

describe('invoiceEventNotification', () => {
    it('links the alert to the invoice that was created', () => {
        const notification = invoiceEventNotification(
            { type: 'invoice.created', id: 'INV-009' },
            defaultNotificationPreferences,
        );

        expect(notification).toMatchObject({
            title: 'Invoice INV-009 created',
            href: '/invoices/INV-009',
        });
    });

    it('does not link a deleted invoice, its page would be a 404', () => {
        const notification = invoiceEventNotification(
            { type: 'invoice.deleted', id: 'INV-009' },
            defaultNotificationPreferences,
        );

        expect(notification?.href).toBeUndefined();
    });

    it('returns nothing for an event type the user turned off', () => {
        const preferences = { ...defaultNotificationPreferences, 'invoice.updated': false };

        const notification = invoiceEventNotification(
            { type: 'invoice.updated', id: 'INV-001' },
            preferences,
        );

        expect(notification).toBeNull();
    });
});
