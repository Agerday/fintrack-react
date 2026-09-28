'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
    ChevronsLeft,
    ChevronsRight,
    FileText,
    LayoutDashboard,
    Palette,
    Receipt,
    Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/lib/store/useSidebarStore';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';

type NavItem = {
    label: string;
    href: string;
    icon: LucideIcon;
};

const mainNavigation: NavItem[] = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Invoices', href: '/invoices', icon: FileText },
    { label: 'Clients', href: '/clients', icon: Users },
];

// Dev tooling, kept apart from the business pages
const secondaryNavigation: NavItem[] = [
    { label: 'App Catalogue', href: '/style-guide', icon: Palette },
];

// '/invoices/INV-001' must still highlight 'Invoices', but '/' must only match the dashboard
function isActive(pathname: string, href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

type NavLinkProps = {
    item: NavItem;
    collapsed: boolean;
    onNavigate?: () => void;
};

function NavLink({ item, collapsed, onNavigate }: NavLinkProps) {
    const pathname = usePathname();
    const active = isActive(pathname, item.href);
    const Icon = item.icon;

    return (
        <Link
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            aria-current={active ? 'page' : undefined}
            className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                collapsed && 'justify-center px-0',
                active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
        >
            <Icon className="size-4 shrink-0" />
            {!collapsed && item.label}
        </Link>
    );
}

type SidebarNavProps = {
    collapsed?: boolean;
    onNavigate?: () => void;
    footer?: React.ReactNode;
};

// Shared content of the desktop sidebar and the mobile drawer
function SidebarNav({ collapsed = false, onNavigate, footer }: SidebarNavProps) {
    return (
        <div className="flex h-full flex-col">
            <div
                className={cn('flex h-16 items-center gap-2.5 px-4', collapsed && 'justify-center')}
            >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Receipt className="size-4" />
                </div>
                {!collapsed && (
                    <span className="font-semibold tracking-tight">Invoice Manager</span>
                )}
            </div>

            <nav className="flex-1 space-y-1 px-3 py-4">
                {mainNavigation.map((item) => (
                    <NavLink
                        key={item.href}
                        item={item}
                        collapsed={collapsed}
                        onNavigate={onNavigate}
                    />
                ))}
            </nav>

            <div className="space-y-1 border-t px-3 py-4">
                {secondaryNavigation.map((item) => (
                    <NavLink
                        key={item.href}
                        item={item}
                        collapsed={collapsed}
                        onNavigate={onNavigate}
                    />
                ))}
                {footer}
            </div>
        </div>
    );
}

// Desktop (lg and up): fixed, collapsible
export function Sidebar() {
    const { isCollapsed, toggle } = useSidebarStore();

    return (
        <aside
            className={cn(
                'fixed inset-y-0 left-0 z-40 hidden border-r bg-sidebar transition-[width] duration-200 lg:block',
                isCollapsed ? 'w-16' : 'w-64',
            )}
        >
            <SidebarNav
                collapsed={isCollapsed}
                footer={
                    <button
                        onClick={toggle}
                        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        className={cn(
                            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                            isCollapsed && 'justify-center px-0',
                        )}
                    >
                        {isCollapsed ? (
                            <ChevronsRight className="size-4" />
                        ) : (
                            <>
                                <ChevronsLeft className="size-4" />
                                Collapse
                            </>
                        )}
                    </button>
                }
            />
        </aside>
    );
}

// Mobile / tablet: same navigation in a drawer, opened from the Header menu button
export function MobileSidebar() {
    const { isMobileOpen, setMobileOpen } = useSidebarStore();

    return (
        <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
            <SheetContent side="left" className="w-72 bg-sidebar p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                {/* Close the drawer once a link is clicked, the page behind changes */}
                <SidebarNav onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
        </Sheet>
    );
}
