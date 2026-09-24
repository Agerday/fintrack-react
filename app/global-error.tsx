'use client';

import './globals.css';
import { Button } from '@/components/ui/button';

type GlobalErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

// last-resort boundary: replaces the root layout when it crashes, so it must render its own <html> and <body>
export default function GlobalError({ reset }: GlobalErrorProps) {
    return (
        <html lang="en">
            <body>
                <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
                    <h2 className="text-xl font-semibold">Something went wrong</h2>
                    <p className="text-slate-500">
                        The application failed to load. Please try again.
                    </p>
                    <Button onClick={reset}>Try again</Button>
                </div>
            </body>
        </html>
    );
}
