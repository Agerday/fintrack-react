'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import type { AppNotification } from '../types';
import { NotificationPanel } from './NotificationPanel';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { selectUnreadCount, useNotificationStore } from '@/lib/store/useNotificationStore';

export function NotificationBell() {
    const [open, setOpen] = useState(false);
    // One selector per value: the bell only re-renders when what it reads changes
    const notifications = useNotificationStore((state) => state.notifications);
    const unreadCount = useNotificationStore(selectUnreadCount);
    const { markAsRead, markAllAsRead, remove, clear } = useNotificationStore.getState();

    function handleSelect(notification: AppNotification) {
        markAsRead(notification.id);
        // A notification with a link navigates away: close the panel behind it
        if (notification.href) setOpen(false);
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                render={
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative"
                        aria-label={
                            unreadCount ? `Notifications (${unreadCount} unread)` : 'Notifications'
                        }
                    >
                        <Bell />
                        {unreadCount > 0 && (
                            <span
                                aria-hidden
                                className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] leading-none font-semibold text-primary-foreground ring-2 ring-background"
                            >
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </Button>
                }
            />
            <PopoverContent
                align="end"
                className="w-[calc(100vw-2rem)] gap-0 overflow-hidden p-0 sm:w-96"
            >
                <NotificationPanel
                    notifications={notifications}
                    unreadCount={unreadCount}
                    onSelect={handleSelect}
                    onRemove={remove}
                    onMarkAllAsRead={markAllAsRead}
                    onClear={clear}
                />
            </PopoverContent>
        </Popover>
    );
}
