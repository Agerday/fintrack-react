import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// A fresh QueryClient per test: the cache is never shared between tests (no hidden coupling).
// retry: false -> a mocked 500 fails right away instead of retrying 3 times with delays
export function createTestQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });
}

// Angular analogy: TestBed.configureTestingModule({ providers: [...] }) + createComponent.
// In React, "providers" are just wrapper components around the element under test
export function renderWithClient(ui: ReactElement) {
    const queryClient = createTestQueryClient();
    // userEvent simulates a real user (focus, keydown, input, keyup, click...), unlike
    // fireEvent which only dispatches one DOM event. setup() must run before render
    const user = userEvent.setup();

    return {
        user,
        queryClient,
        ...render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>),
    };
}
