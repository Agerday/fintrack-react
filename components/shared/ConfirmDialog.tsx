'use client';

import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

type ConfirmDialogProps = {
    // Element that opens the dialog, e.g. a delete button
    trigger: React.ReactElement;
    title: string;
    description: string;
    confirmLabel?: string;
    // Receives `close` so the dialog can stay open (and show isPending) until the mutation ends
    onConfirm: (close: () => void) => void;
    isPending?: boolean;
};

// "Are you sure?" dialog for destructive actions
export function ConfirmDialog({
    trigger,
    title,
    description,
    confirmLabel = 'Delete',
    onConfirm,
    isPending = false,
}: ConfirmDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger render={trigger} />
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                    <Button
                        variant="destructive"
                        disabled={isPending}
                        onClick={() => onConfirm(() => setOpen(false))}
                    >
                        {isPending ? 'Deleting...' : confirmLabel}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
