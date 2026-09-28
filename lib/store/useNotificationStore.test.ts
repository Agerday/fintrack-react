import { describe, expect, it } from 'vitest';
import { MAX_NOTIFICATIONS, selectUnreadCount, useNotificationStore } from './useNotificationStore';
import type { NewNotification } from '@/features/notifications/types';

const sample: NewNotification = { type: 'info', title: 'Invoice updated' };

function store() {
    return useNotificationStore.getState();
}

describe('useNotificationStore', () => {
    it('adds new notifications first, as unread', () => {
        store().add({ ...sample, title: 'First' });
        store().add({ ...sample, title: 'Second' });

        expect(store().notifications.map((n) => n.title)).toEqual(['Second', 'First']);
        expect(selectUnreadCount(store())).toBe(2);
    });

    it('marks a single notification as read', () => {
        const id = store().add(sample);
        store().add(sample);

        store().markAsRead(id);

        expect(store().notifications.find((n) => n.id === id)?.read).toBe(true);
        expect(selectUnreadCount(store())).toBe(1);
    });

    it('marks every notification as read', () => {
        store().add(sample);
        store().add(sample);

        store().markAllAsRead();

        expect(selectUnreadCount(store())).toBe(0);
    });

    it(`keeps only the ${MAX_NOTIFICATIONS} newest notifications`, () => {
        for (let i = 1; i <= MAX_NOTIFICATIONS + 1; i++) store().add({ ...sample, title: `#${i}` });

        const titles = store().notifications.map((n) => n.title);
        expect(titles).toHaveLength(MAX_NOTIFICATIONS);
        expect(titles[0]).toBe(`#${MAX_NOTIFICATIONS + 1}`);
        expect(titles).not.toContain('#1');
    });
});
