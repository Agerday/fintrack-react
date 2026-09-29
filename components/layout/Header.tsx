'use client';

import { Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSidebarStore } from '@/lib/store/useSidebarStore';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';

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

            <div className="flex items-center gap-1 sm:gap-2">
                <NotificationBell />

                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted">
                        <div className="hidden text-right sm:block">
                            <p className="text-sm leading-none font-medium">Adrien Gerday</p>
                            <p className="mt-1 text-xs text-muted-foreground">Admin</p>
                        </div>
                        <Avatar className="size-9">
                            <AvatarImage src="/avatar.png" alt="Adrien Gerday" />
                            <AvatarFallback className="bg-accent text-accent-foreground">
                                AG
                            </AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">Log out</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
