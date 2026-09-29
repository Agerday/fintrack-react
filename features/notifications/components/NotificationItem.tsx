import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import type { AppNotification, NotificationType } from '../types';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';

const typeStyles: Record<NotificationType, { icon: LucideIcon; className: string }> = {
    info: { icon: Info, className: 'bg-accent text-accent-foreground' },
    success: { icon: CheckCircle2, className: 'bg-status-paid/10 text-status-paid' },
    warning: { icon: AlertTriangle, className: 'bg-status-pending/10 text-status-pending' },
    error: { icon: XCircle, className: 'bg-destructive/10 text-destructive' },
};

type NotificationItemProps = {
    notification: AppNotification;
    onSelect: (notification: AppNotification) => void;
    onRemove: (id: string) => void;
};

export function NotificationItem({ notification, onSelect, onRemove }: NotificationItemProps) {
    const { icon: Icon, className } = typeStyles[notification.type];

    const content = (
        <>
            {/* In the left gutter: the right edge is taken by the remove button */}
            {!notification.read && (
                <span
                    className="absolute top-1/2 left-1.5 size-1.5 -translate-y-1/2 rounded-full bg-primary"
                    aria-hidden
                />
            )}
            <span
                className={cn(
                    'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full',
                    className,
                )}
            >
                <Icon className="size-4" />
            </span>
            <span className="min-w-0 flex-1 space-y-0.5 pr-6">
                <span
                    className={cn(
                        'block truncate text-sm',
                        notification.read ? 'text-muted-foreground' : 'font-medium',
                    )}
                >
                    {notification.title}
                </span>
                {notification.message && (
                    <span className="line-clamp-2 block text-xs text-muted-foreground">
                        {notification.message}
                    </span>
                )}
                <span className="block text-xs text-muted-foreground">
                    {formatRelativeTime(notification.createdAt)}
                </span>
            </span>
        </>
    );

    const itemClassName = cn(
        'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50',
        !notification.read && 'bg-accent/40',
    );

    return (
        // group: reveals the remove button on hover (desktop), it stays visible on touch screens
        <li className="group relative">
            {notification.href ? (
                <Link
                    href={notification.href}
                    onClick={() => onSelect(notification)}
                    className={itemClassName}
                >
                    {content}
                </Link>
            ) : (
                <button
                    type="button"
                    onClick={() => onSelect(notification)}
                    className={itemClassName}
                >
                    {content}
                </button>
            )}
            {/* Sibling of the link/button, not a child: a button can't be nested in them */}
            <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Remove notification: ${notification.title}`}
                onClick={() => onRemove(notification.id)}
                className="absolute top-2.5 right-2 text-muted-foreground sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
            >
                <X />
            </Button>
        </li>
    );
}
