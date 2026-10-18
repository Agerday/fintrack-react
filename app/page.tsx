import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Prefetched } from '@/components/shared/Prefetched';
import { readAccount } from '@/features/account/queries';
import {
    DashboardOverview,
    DashboardSkeleton,
} from '@/features/dashboard/components/DashboardOverview';
import { listInvoices } from '@/features/invoices/queries';

export const metadata: Metadata = { title: 'Dashboard' };

// The header is sent at once; the figures and charts stream in with their data already loaded
export default function DashboardPage() {
    return (
        <div className="space-y-6 lg:space-y-8">
            <PageHeader title="Dashboard" description="Overview of your invoices and clients." />

            <Suspense fallback={<DashboardSkeleton />}>
                <Prefetched
                    queries={[
                        { queryKey: ['invoices'], queryFn: listInvoices },
                        { queryKey: ['account'], queryFn: readAccount },
                    ]}
                >
                    <DashboardOverview />
                </Prefetched>
            </Suspense>
        </div>
    );
}
