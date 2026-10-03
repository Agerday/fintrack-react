'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { ThemeProvider } from 'next-themes';
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

    return (
        // class strategy: next-themes toggles .dark on <html>, matching @custom-variant dark
        // in globals.css. Its inline script sets it before paint, so no light flash on load
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </ThemeProvider>
    );
}
