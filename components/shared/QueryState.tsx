import type { ReactNode } from 'react';
import { ApiError } from '@/lib/api-error';
import { ErrorMessage } from '@/lib/errors';

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
    if (error) {
        const message = error instanceof ApiError ? ErrorMessage[error.code] : error.message;
        return <div>{message}</div>;
    }
    if (isEmpty) return <div>{emptyMessage}</div>;

    return <>{children}</>;
}
