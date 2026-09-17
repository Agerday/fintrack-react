'use client'

import Link from "next/link";
import {usePathname} from "next/navigation";
import {FileText, LayoutDashboard, Settings, Users,} from "lucide-react";

const navigation = [
    {
        label: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        label: "Invoices",
        href: "/invoices",
        icon: FileText,
    },
    {
        label: "Clients",
        href: "/clients",
        icon: Users,
    },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed inset-y-0 left-0 w-64 border-r bg-white">
            <div className="flex h-16 items-center border-b px-6">
                <span className="text-lg font-semibold">Invoice Manager</span>
            </div>

            <nav className="space-y-1 p-4">
                {navigation.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                                active
                                    ? "bg-slate-100 text-slate-900"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                        >
                            <Icon className="h-4 w-4"/>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="absolute bottom-4 left-0 right-0 px-4">
                <Link
                    href="/settings"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-50"
                >
                    <Settings className="h-4 w-4"/>
                    Settings
                </Link>
            </div>
        </aside>
    );
}