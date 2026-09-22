'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { ApiError } from '@/lib/api-error';

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        retry: (failureCount, error) => {
                            if (error instanceof ApiError) {
                                // Never retry client errors — retrying won't fix a 404 or 401
                                if (error.status === 404 || error.status === 401) return false;
                            }
                            // Retry other errors (network, 500) up to 2 times
                            return failureCount < 2;
                        },
                    },
                },
            }),
    );

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
