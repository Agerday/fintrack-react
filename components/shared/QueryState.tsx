import type { ReactNode } from 'react';

type QueryStateProps = {
    isPending: boolean;
    error?: Error | null;
    isEmpty?: boolean;
    emptyMessage?: string;
    children: ReactNode;
};

export function QueryState({
    isPending,
    error,
    isEmpty,
    emptyMessage = 'No data found',
    children,
}: QueryStateProps) {
    if (isPending) return <div>Loading...</div>;
    if (error) return <div>{error.message}</div>;
    if (isEmpty) return <div>{emptyMessage}</div>;

    return <>{children}</>;
}
