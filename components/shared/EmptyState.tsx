import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type EmptyStateProps = {
    icon: LucideIcon;
    title: string;
    description?: string;
    action?: React.ReactNode;
    tone?: 'default' | 'destructive';
    className?: string;
};

// Centered icon + message + optional action. Used for empty lists, errors and 404s
export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    tone = 'default',
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center',
                className,
            )}
        >
            <div
                className={cn(
                    'flex size-12 items-center justify-center rounded-full',
                    tone === 'destructive'
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-accent text-accent-foreground',
                )}
            >
                <Icon className="size-5" />
            </div>
            <div className="space-y-1">
                <p className="font-medium">{title}</p>
                {description && (
                    <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
                )}
            </div>
            {action}
        </div>
    );
}
