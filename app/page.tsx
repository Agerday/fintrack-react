'use client';

import { DollarSign, FileText, Users } from 'lucide-react';
import { StatsGrid } from '@/features/dashboard/components/StatsGrid';
import { RecentInvoices } from '@/features/dashboard/components/RecentInvoices';
import type { StatCardProps } from '@/components/layout/StatCard';
import { QueryState } from '@/components/shared/QueryState';
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

export default function DashboardPage() {
    const { data: invoices = [], isLoading, error } = useInvoices();
    const recentInvoices = invoices.slice(-5).reverse();

    return (
        <QueryState isPending={isLoading} error={error}>
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Overview of your invoices and clients.
                    </p>
                </div>

                <StatsGrid stats={stats} />
                <RecentInvoices invoices={recentInvoices} />
            </div>
        </QueryState>
    );
}
