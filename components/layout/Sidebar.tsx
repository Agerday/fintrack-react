'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    ChevronLeft,
    ChevronRight,
    FileText,
    LayoutDashboard,
    Palette,
    Settings,
    Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/lib/store/useSidebarStore';

const navigation = [
    {
        label: 'App Catalogue',
        href: '/style-guide',
        icon: Palette,
    },
    {
        label: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
    },
    {
        label: 'Invoices',
        href: '/invoices',
        icon: FileText,
    },
    {
        label: 'Clients',
        href: '/clients',
        icon: Users,
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const { isCollapsed, toggle } = useSidebarStore();

    return (
        <aside
            className={cn(
                'fixed inset-y-0 left-0 border-r bg-white transition-all duration-200',
                isCollapsed ? 'w-16' : 'w-64',
            )}
        >
            <div className="flex h-16 items-center justify-between border-b px-4">
                {!isCollapsed && <span className="text-lg font-semibold">Invoice Manager</span>}

                <button
                    onClick={toggle}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </button>
            </div>

            <nav className="space-y-1 p-4">
                {navigation.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                                isCollapsed && 'justify-center',
                                active
                                    ? 'bg-slate-100 text-slate-900'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
                            )}
                        >
                            <Icon className="h-4 w-4 shrink-0" />
                            {!isCollapsed && item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="absolute bottom-4 left-0 right-0 px-4">
                <Link
                    href="/settings"
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-50',
                        isCollapsed && 'justify-center',
                    )}
                >
                    <Settings className="h-4 w-4 shrink-0" />
                    {!isCollapsed && 'Settings'}
                </Link>
            </div>
        </aside>
    );
}
