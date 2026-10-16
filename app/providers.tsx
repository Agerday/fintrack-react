'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { makeQueryClient } from '@/lib/query-client';
import { useNotificationPreferencesStore } from '@/lib/store/useNotificationPreferencesStore';

export default function Providers({ children }: { children: React.ReactNode }) {
    // useState, not a module constant: created once per mount, never shared between requests
    // during server rendering
    const [queryClient] = useState(makeQueryClient);

    // After hydration, so the first client render matches the server (see the store)
    useEffect(() => {
        void useNotificationPreferencesStore.persist.rehydrate();
    }, []);

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
