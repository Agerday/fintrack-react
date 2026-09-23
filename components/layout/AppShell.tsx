'use client';

import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useSidebarStore } from '@/lib/store/useSidebarStore';

//handle our SidebarStore & wrap the app
export function AppShell({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebarStore();

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />

            <div className={cn('transition-all duration-200', isCollapsed ? 'pl-16' : 'pl-64')}>
                <Header />
                <main className="p-8">{children}</main>
            </div>
        </div>
    );
}
