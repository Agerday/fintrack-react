'use client';

import { DollarSign, FileText, Users } from 'lucide-react';
import { StatsGrid } from '@/features/dashboard/components/StatsGrid';
import { RecentInvoices } from '@/features/dashboard/components/RecentInvoices';
import type { StatCardProps } from '@/components/layout/StatCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { QueryState } from '@/components/shared/QueryState';
import { Skeleton } from '@/components/ui/skeleton';
import { useInvoices } from '@/features/invoices/hooks';

const stats: StatCardProps[] = [
    {
        label: 'Total revenue',
        value: 24580,
        valueType: 'currency',
        change: '+12.5%',
        icon: DollarSign,
    },
    { label: 'Outstanding', value: 8420, valueType: 'currency', change: '+4.2%', icon: FileText },
    { label: 'Paid invoices', value: 86, change: '+8.1%', icon: FileText },
    { label: 'Active clients', value: 24, change: '+3', icon: Users },
];

// Same layout as the loaded dashboard, so nothing jumps when the data arrives
function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                {stats.map((stat) => (
                    <Skeleton key={stat.label} className="h-32 rounded-xl" />
                ))}
            </div>
            <Skeleton className="h-80 rounded-xl" />
        </div>
    );
}

export default function DashboardPage() {
    const { data: invoices = [], isLoading, error, refetch } = useInvoices();
    const recentInvoices = invoices.slice(-5).reverse();

    return (
        <div className="space-y-6 lg:space-y-8">
            <PageHeader title="Dashboard" description="Overview of your invoices and clients." />

            <QueryState
                isPending={isLoading}
                error={error}
                onRetry={() => void refetch()}
                loadingFallback={<DashboardSkeleton />}
            >
                <div className="space-y-6">
                    <StatsGrid stats={stats} />
                    <RecentInvoices invoices={recentInvoices} />
                </div>
            </QueryState>
        </div>
    );
}
