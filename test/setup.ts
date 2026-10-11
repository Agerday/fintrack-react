import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './msw/server';
import { accountDb } from './msw/handlers/account';
import { clientDb } from './msw/handlers/clients';
import { invoiceDb } from './msw/handlers/invoices';
import { profileDb } from './msw/handlers/profile';
import { companyDb } from './msw/handlers/company';
import { useNotificationStore } from '@/lib/store/useNotificationStore';

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
    useNotificationStore.getState().clear();
    // clear: call history of vi.fn() / vi.mock() mocks. restore: original methods behind spyOn
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
});

afterAll(() => server.close());
