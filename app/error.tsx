'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';

type ErrorPageProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
    useEffect(() => {
        // Replace with Sentry.captureException(error) in a real production app
        console.error(error);
    }, [error]);

    return (
        <EmptyState
            icon={AlertTriangle}
            tone="destructive"
            title="Something went wrong"
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
