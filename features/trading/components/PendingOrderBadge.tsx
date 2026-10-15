import { pendingOrderLabels } from '../rules';
import type { PendingOrderType } from '../types';
import { Badge } from '@/components/ui/badge';

const variants = {
    stop_loss: 'destructive',
    take_profit: 'secondary',
    buy_limit: 'outline',
} as const satisfies Record<PendingOrderType, string>;

type PendingOrderBadgeProps = {
    type: PendingOrderType;
};

export function PendingOrderBadge({ type }: PendingOrderBadgeProps) {
    return <Badge variant={variants[type]}>{pendingOrderLabels[type]}</Badge>;
}
