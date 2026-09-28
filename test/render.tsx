import type { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// One client per test so no cache leaks between tests. No retries: a mocked 500 fails at once
function createTestQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });
}

function createWrapper(queryClient: QueryClient) {
    return function Wrapper({ children }: { children: ReactNode }) {
        return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    };
}

export function renderWithClient(ui: ReactElement) {
    const queryClient = createTestQueryClient();
    const user = userEvent.setup();
    return { user, queryClient, ...render(ui, { wrapper: createWrapper(queryClient) }) };
}

export function renderHookWithClient<Result>(hook: () => Result) {
    const queryClient = createTestQueryClient();
    return { queryClient, ...renderHook(hook, { wrapper: createWrapper(queryClient) }) };
}
