import { create } from 'zustand';
import type { AppNotification, NewNotification } from '@/features/notifications/types';

// Oldest notifications are dropped beyond this, so a long session can't grow the list forever
export const MAX_NOTIFICATIONS = 50;

type NotificationState = {
    // Newest first
    notifications: AppNotification[];
    add: (notification: NewNotification) => string;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    remove: (id: string) => void;
    clear: () => void;
};

// Client-only state (no server behind it yet), hence Zustand and not TanStack Query.
// Outside React (e.g. a WebSocket onmessage), push with useNotificationStore.getState().add(...)
export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],

    add: (notification) => {
        const id = crypto.randomUUID();
        set((state) => ({
            notifications: [
                { ...notification, id, createdAt: new Date().toISOString(), read: false },
                ...state.notifications,
            ].slice(0, MAX_NOTIFICATIONS),
        }));
        return id;
    },

    markAsRead: (id) =>
        set((state) => ({
            notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),

    markAllAsRead: () =>
        set((state) => ({
            notifications: state.notifications.map((n) => (n.read ? n : { ...n, read: true })),
        })),

    remove: (id) =>
        set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) })),

    clear: () => set({ notifications: [] }),
}));

// Derived value as a selector, not stored: it can never get out of sync with the list
export function selectUnreadCount(state: NotificationState) {
    return state.notifications.filter((n) => !n.read).length;
}
