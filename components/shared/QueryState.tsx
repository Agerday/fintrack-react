import type { ReactNode } from 'react';
import { AlertTriangle, Inbox, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';

type QueryStateProps = {
    isPending: boolean;
    error?: Error | null;
    isEmpty?: boolean;
    emptyMessage?: string;
    // Pass the query's refetch to show a "Try again" button on error
    onRetry?: () => void;
    // Custom placeholder shaped like the content, defaults to a few grey bars
    loadingFallback?: ReactNode;
    children: ReactNode;
};

function DefaultSkeleton() {
    return (
        <div className="space-y-3" aria-busy="true" aria-label="Loading">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
    );
}

export function QueryState({
    isPending,
    error,
    isEmpty,
    emptyMessage = 'No data found',
    onRetry,
    loadingFallback,
    children,
}: QueryStateProps) {
    if (isPending) return loadingFallback ?? <DefaultSkeleton />;

    if (error) {
        return (
            <EmptyState
                icon={AlertTriangle}
                tone="destructive"
                title="Something went wrong"
                description={error.message}
                action={
                    onRetry && (
                        <Button variant="outline" onClick={onRetry}>
                            <RotateCw />
                            Try again
                        </Button>
                    )
                }
            />
        );
    }

    if (isEmpty) return <EmptyState icon={Inbox} title={emptyMessage} />;

    return <>{children}</>;
}
