import type { LucideIcon } from 'lucide-react';

export type StatCardProps = {
    label: string;
    value: string;
    change: string;
    icon: LucideIcon;
};

export function StatCard({ label, value, change, icon: Icon }: StatCardProps) {
    return (
        <div className="rounded-xl border bg-white p-6">
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{label}</p>

                <div className="rounded-lg bg-slate-100 p-2">
                    <Icon className="h-4 w-4 text-slate-600" />
                </div>
            </div>

            <p className="mt-4 text-2xl font-semibold">{value}</p>

            <p className="mt-1 text-xs text-green-600">{change} from last month</p>
        </div>
    );
}
