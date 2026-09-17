import { DollarSign, FileText, Users } from 'lucide-react';
import { StatsGrid } from '@/features/dashboard/components/StatsGrid';
import { RecentInvoices } from '@/features/dashboard/components/RecentInvoices';
import type { StatCardProps } from '@/components/layout/StatCard';
import type { Invoice } from '@/features/invoices/types';

const stats: StatCardProps[] = [
    { label: 'Total revenue', value: '$24,580', change: '+12.5%', icon: DollarSign },
    { label: 'Outstanding', value: '$8,420', change: '+4.2%', icon: FileText },
    { label: 'Paid invoices', value: '86', change: '+8.1%', icon: FileText },
    { label: 'Active clients', value: '24', change: '+3', icon: Users },
];

const recentInvoices: Pick<Invoice, 'id' | 'client' | 'amount' | 'status'>[] = [
    { id: 'INV-001', client: 'Acme Corporation', amount: 2400, status: 'paid' },
    { id: 'INV-002', client: 'Globex Inc.', amount: 1850, status: 'pending' },
    { id: 'INV-003', client: 'Soylent Corp.', amount: 3200, status: 'paid' },
    { id: 'INV-004', client: 'Initech', amount: 980, status: 'overdue' },
];

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
