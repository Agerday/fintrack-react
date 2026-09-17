import Link from 'next/link';
import { ArrowUpRight, DollarSign, FileText, Users } from 'lucide-react';

const stats = [
    {
        label: 'Total revenue',
        value: '$24,580',
        change: '+12.5%',
        icon: DollarSign,
    },
    {
        label: 'Outstanding',
        value: '$8,420',
        change: '+4.2%',
        icon: FileText,
    },
    {
        label: 'Paid invoices',
        value: '86',
        change: '+8.1%',
        icon: FileText,
    },
    {
        label: 'Active clients',
        value: '24',
        change: '+3',
        icon: Users,
    },
];

const recentInvoices = [
    {
        id: 'INV-001',
        client: 'Acme Corporation',
        amount: '$2,400',
        status: 'Paid',
    },
    {
        id: 'INV-002',
        client: 'Globex Inc.',
        amount: '$1,850',
        status: 'Pending',
    },
    {
        id: 'INV-003',
        client: 'Soylent Corp.',
        amount: '$3,200',
        status: 'Paid',
    },
    {
        id: 'INV-004',
        client: 'Initech',
        amount: '$980',
        status: 'Overdue',
    },
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

            <div className="grid grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <div key={stat.label} className="rounded-xl border bg-white p-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-500">{stat.label}</p>

                                <div className="rounded-lg bg-slate-100 p-2">
                                    <Icon className="h-4 w-4 text-slate-600" />
                                </div>
                            </div>

                            <p className="mt-4 text-2xl font-semibold">{stat.value}</p>

                            <p className="mt-1 text-xs text-green-600">
                                {stat.change} from last month
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="rounded-xl border bg-white">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div>
                        <h2 className="font-semibold">Recent invoices</h2>
                        <p className="text-sm text-slate-500">Your latest invoices</p>
                    </div>

                    <Link
                        href="/invoices"
                        className="flex items-center gap-1 text-sm font-medium text-slate-900 hover:underline"
                    >
                        View all
                        <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="divide-y">
                    {recentInvoices.map((invoice) => (
                        <div
                            key={invoice.id}
                            className="flex items-center justify-between px-6 py-4"
                        >
                            <div>
                                <p className="text-sm font-medium">{invoice.id}</p>
                                <p className="text-sm text-slate-500">{invoice.client}</p>
                            </div>

                            <div className="flex items-center gap-8">
                                <span className="text-sm font-medium">{invoice.amount}</span>

                                <span className="w-20 text-right text-sm text-slate-500">
                                    {invoice.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
