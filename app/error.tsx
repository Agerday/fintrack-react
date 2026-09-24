'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

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
        <div className="flex flex-col items-center gap-4 py-16 text-center">
            <h2 className="text-xl font-semibold">Something went wrong</h2>
            <p className="text-slate-500">An unexpected error occurred. Please try again.</p>
            <Button onClick={reset}>Try again</Button>
        </div>
    );
}
