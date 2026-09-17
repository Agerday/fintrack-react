import { DollarSign, FileText, Users } from 'lucide-react';
import { StatsGrid } from '@/features/dashboard/components/StatsGrid';
import { RecentInvoices } from '@/features/dashboard/components/RecentInvoices';
import type { StatCardProps } from '@/components/layout/StatCard';
import { invoices } from '@/features/invoices/data';

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

const recentInvoices = invoices.slice(-5).reverse();

export default function DashboardPage() {
    return (
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
    );
}
