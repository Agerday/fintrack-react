import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './msw/server';
import { accountDb } from './msw/handlers/account';
import { clientDb } from './msw/handlers/clients';
import { invoiceDb } from './msw/handlers/invoices';
import { profileDb } from './msw/handlers/profile';
import { companyDb } from './msw/handlers/company';
import { tradingDb } from './msw/handlers/trading';
import { useMarketStore } from '@/lib/store/useMarketStore';
import { useNotificationStore } from '@/lib/store/useNotificationStore';
import { useNotificationPreferencesStore } from '@/lib/store/useNotificationPreferencesStore';
import { defaultNotificationPreferences } from '@/features/notifications/rules';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
    // Testing Library only auto-unmounts when Vitest globals are on, and they are off
    cleanup();
    server.resetHandlers();
    server.events.removeAllListeners();
    invoiceDb.reset();
    clientDb.reset();
    accountDb.reset();
    profileDb.reset();
    companyDb.reset();
    tradingDb.reset();
    useNotificationStore.getState().clear();
    useMarketStore.getState().reset();
    // Route Handler tests run in node: no localStorage there, and nothing persisted to clear
    if (typeof window !== 'undefined') {
        useNotificationPreferencesStore.setState({ preferences: defaultNotificationPreferences });
        localStorage.clear();
    }
    // clear: call history of vi.fn() / vi.mock() mocks. restore: original methods behind spyOn
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
});

afterAll(() => server.close());
