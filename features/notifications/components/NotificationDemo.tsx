'use client';

import type { NewNotification } from '../types';
import { Button } from '@/components/ui/button';
import { useNotificationStore } from '@/lib/store/useNotificationStore';

// Sample payloads, the kind the invoice WebSocket events will produce once wired
const samples: NewNotification[] = [
    {
        type: 'info',
        title: 'Invoice INV-002 was updated',
        message: 'Globex Inc. changed the amount to $1,850.00.',
        href: '/invoices/INV-002',
    },
    {
        type: 'success',
        title: 'Invoice INV-001 marked as paid',
        message: 'Acme Corporation paid $2,400.00.',
        href: '/invoices/INV-001',
    },
    {
        type: 'warning',
        title: 'Invoice INV-004 is overdue',
        message: 'Initech has not paid $980.00, due 3 days ago.',
        href: '/invoices/INV-004',
    },
    {
        type: 'error',
        title: 'Real-time connection lost',
        message: 'Reconnecting… Changes from other users may be delayed.',
    },
];

// Style guide only: pushes sample notifications to preview the bell without a WebSocket
export function NotificationDemo() {
    const add = useNotificationStore((state) => state.add);

    return (
        <div className="flex flex-wrap gap-2">
            {samples.map((sample) => (
                <Button key={sample.type} variant="outline" onClick={() => add(sample)}>
                    Push {sample.type}
                </Button>
            ))}
        </div>
    );
}
