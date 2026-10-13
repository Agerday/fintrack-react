import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    defaultNotificationPreferences,
    type InvoiceEventType,
    type NotificationPreferences,
} from '@/features/notifications/rules';

type NotificationPreferencesState = {
    preferences: NotificationPreferences;
    setEnabled: (type: InvoiceEventType, enabled: boolean) => void;
};

// Kept in localStorage: a per-browser choice, no server behind it.
// skipHydration: the server renders the defaults, so reading localStorage during the first
// client render would mismatch. Providers rehydrates it in an effect, after hydration
export const useNotificationPreferencesStore = create<NotificationPreferencesState>()(
    persist(
        (set) => ({
            preferences: defaultNotificationPreferences,
            setEnabled: (type, enabled) =>
                set((state) => ({ preferences: { ...state.preferences, [type]: enabled } })),
        }),
        { name: 'notification-preferences', skipHydration: true },
    ),
);
