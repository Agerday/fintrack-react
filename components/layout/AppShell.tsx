'use client';

import { cn } from '@/lib/utils';
import { MobileSidebar, Sidebar } from './Sidebar';
import { Header } from './Header';
import { useSidebarStore } from '@/lib/store/useSidebarStore';

//handle our SidebarStore & wrap the app
export function AppShell({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebarStore();

    return (
        <div className="min-h-screen bg-background">
            <Sidebar />
            <MobileSidebar />

            {/* The sidebar is fixed, so the content is offset by its width (desktop only) */}
            <div
                className={cn(
                    'transition-[padding] duration-200',
                    isCollapsed ? 'lg:pl-16' : 'lg:pl-64',
                )}
            >
                <Header />
                <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
