'use client';

import { CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { FormError } from '@/components/shared/FormField';
import { useResetDemoData } from '@/features/demo/hooks';

export function DemoDataSettings() {
    const { mutate, isPending, isSuccess, isError, error } = useResetDemoData();

    return (
        <Card>
            <CardContent className="space-y-3 text-sm">
                <p>
                    FinTrack runs on an in-memory demo backend. Resetting brings back the seeded
                    invoices, clients, bank account, company and profile, and drops every change
                    made since the server started.
                </p>
                <p className="text-muted-foreground">
                    Your theme and notification preferences are kept.
                </p>
                <FormError message={isError ? error.message : undefined} />
            </CardContent>

            <CardFooter className="justify-end gap-3 border-t">
                {isSuccess && (
                    <p
                        role="status"
                        className="flex items-center gap-1.5 text-sm text-muted-foreground"
                    >
                        <CheckCircle2 className="size-4 text-status-paid" />
                        Demo data restored
                    </p>
                )}
                <ConfirmDialog
                    title="Reset the demo data?"
                    description="Every invoice, client and payment you added or changed will be lost."
                    confirmLabel="Reset"
                    pendingLabel="Resetting..."
                    isPending={isPending}
                    onConfirm={(close) => mutate(undefined, { onSettled: close })}
                    trigger={
                        <Button variant="destructive">
                            <RotateCcw />
                            Reset demo data
                        </Button>
                    }
                />
            </CardFooter>
        </Card>
    );
}
