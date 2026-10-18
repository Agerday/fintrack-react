'use client';

import { FileText, Landmark, Users } from 'lucide-react';
import { StatsGrid } from '@/features/dashboard/components/StatsGrid';
import { RecentInvoices } from '@/features/dashboard/components/RecentInvoices';
import type { StatCardProps } from '@/components/layout/StatCard';
import { QueryState } from '@/components/shared/QueryState';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useAccount } from '@/features/account/hooks';
import { useInvoices } from '@/features/invoices/hooks';
import { recentInvoices } from '@/features/invoices/rules';
import { sumAmountByClient, sumAmountByStatus } from '@/features/dashboard/rules';
import { TopMovers } from '@/features/trading/components/TopMovers';

// Chart.js is only needed to draw on a canvas, which can't happen on the server: the charts and
// the library load in their own chunk once the dashboard is on screen, like a lazy-loaded
// Angular component. Same size placeholder meanwhile, so the page doesn't jump
const chartPlaceholder = () => <Skeleton className="h-80 rounded-xl" />;

const AmountByClientChart = dynamic(
    () => import('./AmountByClientChart').then((module) => module.AmountByClientChart),
    { ssr: false, loading: chartPlaceholder },
);

const CollectionRateChart = dynamic(
    () => import('./CollectionRateChart').then((module) => module.CollectionRateChart),
    { ssr: false, loading: chartPlaceholder },
);

// Only the cash balance is live for now: the other figures are still placeholders
function buildStats(balance: number): StatCardProps[] {
    return [
        { label: 'Cash available', value: balance, valueType: 'currency', icon: Landmark },
        {
            label: 'Outstanding',
            value: 8420,
            valueType: 'currency',
            change: '+4.2%',
            icon: FileText,
        },
        { label: 'Paid invoices', value: 86, change: '+8.1%', icon: FileText },
        { label: 'Active clients', value: 24, change: '+3', icon: Users },
    ];
}

// Same layout as the loaded dashboard, so nothing jumps when the data arrives
export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                {[1, 2, 3, 4].map((card) => (
                    <Skeleton key={card} className="h-32 rounded-xl" />
                ))}
            </div>
            <Skeleton className="h-40 rounded-xl" />
            <div className="grid gap-6 lg:grid-cols-2">
                <Skeleton className="h-80 rounded-xl" />
                <Skeleton className="h-80 rounded-xl" />
            </div>
            <Skeleton className="h-80 rounded-xl" />
        </div>
    );
}

// The live part of the dashboard. Its data is prefetched on the server (see app/page.tsx), so
// it paints with figures right away; the skeleton is only seen when that prefetch failed
export function DashboardOverview() {
    const { data: invoices = [], isLoading, error, refetch } = useInvoices();
    const account = useAccount();
    const recent = recentInvoices(invoices);
    // Stable references between renders: a new array would make the charts redraw every time
    const amountByStatus = useMemo(() => sumAmountByStatus(invoices), [invoices]);
    const amountByClient = useMemo(() => sumAmountByClient(invoices), [invoices]);

    return (
        <QueryState
            isPending={isLoading || account.isLoading}
            error={error ?? account.error}
            onRetry={() => {
                void refetch();
                void account.refetch();
            }}
            loadingFallback={<DashboardSkeleton />}
        >
            <div className="space-y-6">
                <StatsGrid stats={buildStats(account.data?.balance ?? 0)} />
                <TopMovers />
                <div className="grid gap-6 lg:grid-cols-2">
                    <AmountByClientChart data={amountByClient} />
                    <CollectionRateChart data={amountByStatus} />
                </div>
                <RecentInvoices invoices={recent} />
            </div>
        </QueryState>
    );
}
