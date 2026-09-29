import { BellOff } from 'lucide-react';
import type { AppNotification } from '../types';
import { NotificationItem } from './NotificationItem';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';

type NotificationPanelProps = {
    notifications: AppNotification[];
    unreadCount: number;
    onSelect: (notification: AppNotification) => void;
    onRemove: (id: string) => void;
    onMarkAllAsRead: () => void;
    onClear: () => void;
};

export function NotificationPanel({
    notifications,
    unreadCount,
    onSelect,
    onRemove,
    onMarkAllAsRead,
    onClear,
}: NotificationPanelProps) {
    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
                <div>
                    <p className="font-medium">Notifications</p>
                    <p className="text-xs text-muted-foreground">
                        {unreadCount ? `${unreadCount} unread` : 'All caught up'}
                    </p>
                </div>
                <Button variant="ghost" size="sm" disabled={!unreadCount} onClick={onMarkAllAsRead}>
                    Mark all as read
                </Button>
            </div>

            {notifications.length ? (
                <>
                    <ul className="max-h-96 divide-y overflow-y-auto">
                        {notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onSelect={onSelect}
                                onRemove={onRemove}
                            />
                        ))}
                    </ul>
                    <div className="border-t p-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-muted-foreground"
                            onClick={onClear}
                        >
                            Clear all
                        </Button>
                    </div>
                </>
            ) : (
                <EmptyState
                    icon={BellOff}
                    title="No notifications"
                    description="Invoice updates will show up here."
                    className="m-3 border-none py-8"
                />
            )}
        </div>
    );
}
