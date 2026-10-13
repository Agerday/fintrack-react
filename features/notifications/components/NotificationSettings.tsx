'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import type { InvoiceEventType } from '@/features/notifications/rules';
import { useNotificationPreferencesStore } from '@/lib/store/useNotificationPreferencesStore';

const alerts: { type: InvoiceEventType; title: string; description: string }[] = [
    {
        type: 'invoice.created',
        title: 'Invoice created',
        description: 'A new invoice is added in another tab or window.',
    },
    {
        type: 'invoice.updated',
        title: 'Invoice updated',
        description: 'An invoice is edited or marked as paid elsewhere.',
    },
    {
        type: 'invoice.deleted',
        title: 'Invoice deleted',
        description: 'An invoice is removed elsewhere.',
    },
];

export function NotificationSettings() {
    const preferences = useNotificationPreferencesStore((state) => state.preferences);
    const setEnabled = useNotificationPreferencesStore((state) => state.setEnabled);

    return (
        <Card>
            <CardContent className="divide-y">
                {alerts.map(({ type, title, description }) => (
                    // Not wrapped in a <label>: the label would forward the click to the
                    // switch's hidden input and toggle it a second time
                    <div
                        key={type}
                        className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                    >
                        <div className="space-y-1">
                            <p id={`${type}-title`} className="text-sm font-medium">
                                {title}
                            </p>
                            <p id={`${type}-description`} className="text-sm text-muted-foreground">
                                {description}
                            </p>
                        </div>
                        <Switch
                            aria-labelledby={`${type}-title`}
                            aria-describedby={`${type}-description`}
                            checked={preferences[type]}
                            onCheckedChange={(checked) => setEnabled(type, checked)}
                        />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
