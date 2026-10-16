'use client';

import { RouteError, type RouteErrorProps } from '@/components/shared/RouteError';

// Covers the list and the detail pages: the rest of the app stays usable
export default function InvoicesError(props: RouteErrorProps) {
    return <RouteError {...props} title="Invoices could not be loaded" />;
}
