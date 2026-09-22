import type { ReactNode } from 'react';

type QueryStateProps = {
    isPending: boolean;
    isError: boolean;
    isEmpty?: boolean;
    emptyMessage?: string;
    children: ReactNode;
};

export function QueryState({
    isPending,
    isError,
    isEmpty,
    emptyMessage = 'No data found',
    children,
}: QueryStateProps) {
    if (isPending) return <div>Loading...</div>;
    if (isError) return <div>Something went wrong</div>;
    if (isEmpty) return <div>{emptyMessage}</div>;

    return <>{children}</>;
}
