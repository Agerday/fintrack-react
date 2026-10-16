'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';

// The props Next passes to every error.tsx
export type RouteErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

type Props = RouteErrorProps & {
    title?: string;
};

// The body of every error.tsx. A section's own error.tsx catches what breaks inside it, so the
// rest of the app (sidebar, header) keeps working, like an Angular ErrorHandler scoped to a route
export function RouteError({ error, reset, title = 'Something went wrong' }: Props) {
    useEffect(() => {
        // Replace with Sentry.captureException(error) in a real production app
        console.error(error);
    }, [error]);

    return (
        <EmptyState
            icon={AlertTriangle}
            tone="destructive"
            title={title}
            description="An unexpected error occurred. Please try again."
            className="mt-8 py-16"
            action={
                <Button onClick={reset}>
                    <RotateCw />
                    Try again
                </Button>
            }
        />
    );
}
