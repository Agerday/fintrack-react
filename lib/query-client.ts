import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/api-error';

// Shared by the browser (one client for the app's lifetime, in Providers) and the server (a
// fresh one per request, so two users never share a cache)
export function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // Data prefetched on the server is fresh when the page hydrates: without this,
                // every query would refetch on mount and fetch the same data twice. Mutations
                // and socket events still refresh at once through invalidateQueries
                staleTime: 60 * 1000,
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
    });
}
