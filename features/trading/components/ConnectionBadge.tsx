import { Badge } from '@/components/ui/badge';
import type { ConnectionStatus } from '@/hooks/useWebSocket';
import { cn } from '@/lib/utils';

const labels: Record<ConnectionStatus, string> = {
    connecting: 'Connecting…',
    open: 'Live',
    closed: 'Offline, reconnecting…',
};

type ConnectionBadgeProps = {
    status: ConnectionStatus;
};

export function ConnectionBadge({ status }: ConnectionBadgeProps) {
    return (
        <Badge variant={status === 'closed' ? 'destructive' : 'outline'} role="status">
            <span
                className={cn(
                    'size-2 rounded-full',
                    status === 'open' && 'animate-pulse bg-success',
                    status === 'connecting' && 'bg-muted-foreground',
                    status === 'closed' && 'bg-destructive',
                )}
            />
            {labels[status]}
        </Badge>
    );
}
