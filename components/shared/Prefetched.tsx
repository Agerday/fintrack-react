import type { ReactNode } from 'react';
import { connection } from 'next/server';
import { dehydrate, HydrationBoundary, type QueryKey } from '@tanstack/react-query';
import { makeQueryClient } from '@/lib/query-client';

export type ServerQuery = {
    queryKey: QueryKey;
    // A server read from features/<domain>/queries.ts
    queryFn: () => unknown;
};

type PrefetchedProps = {
    queries: ServerQuery[];
    children: ReactNode;
};

// Server Component: runs the reads on the server and hands their results to the client cache,
// so the Client Components below render with data on the first paint, no loading spinner.
// Their useQuery calls use the same keys and find the data already there. Wrap it in
// <Suspense> so the rest of the page streams without waiting for it
export async function Prefetched({ queries, children }: PrefetchedProps) {
    // Rendered per request: without it, the build would freeze the in-memory data of that moment
    await connection();

    const queryClient = makeQueryClient();
    // A read that throws (an unknown id) is left out: the client fetches it and shows the error.
    // No retry: a synchronous read fails the same way every time, retrying would only stall
    await Promise.all(
        queries.map((query) => queryClient.prefetchQuery({ ...query, retry: false })),
    );

    return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}
