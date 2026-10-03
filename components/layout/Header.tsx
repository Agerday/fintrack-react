'use client';

import { Menu } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSidebarStore } from '@/lib/store/useSidebarStore';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export function Header() {
    const setMobileOpen = useSidebarStore((state) => state.setMobileOpen);

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    aria-label="Open navigation"
                    onClick={() => setMobileOpen(true)}
                >
                    <Menu />
                </Button>
                <p className="text-sm text-muted-foreground">Welcome back</p>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                    <ThemeToggle />
                    <NotificationBell />
                </div>
                <Separator orientation="vertical" className="h-6 self-center" />
                {/* Display only until a profile page exists to link to */}
                <div className="flex items-center gap-2.5">
                    <Avatar className="size-9">
                        <AvatarFallback className="bg-accent text-accent-foreground">
                            AG
                        </AvatarFallback>
                    </Avatar>
                    <div className="hidden leading-tight sm:block">
                        <p className="text-sm font-medium">Adrien Gerday</p>
                        <p className="text-xs text-muted-foreground">Admin</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
