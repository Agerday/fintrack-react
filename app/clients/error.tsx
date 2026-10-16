'use client';

import { RouteError, type RouteErrorProps } from '@/components/shared/RouteError';

export default function ClientsError(props: RouteErrorProps) {
    return <RouteError {...props} title="Clients could not be loaded" />;
}
