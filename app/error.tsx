'use client';

import { RouteError, type RouteErrorProps } from '@/components/shared/RouteError';

export default function ErrorPage(props: RouteErrorProps) {
    return <RouteError {...props} />;
}
