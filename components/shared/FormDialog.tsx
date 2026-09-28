'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useHotkey } from '@/hooks/useHotkey';

type FormDialogProps = {
    title: string;
    description?: string;
    triggerLabel: string;
    // Optional single-key shortcut that opens the dialog, shown on the trigger button
    hotkey?: string;
    // Render prop: the form receives `close` to call once it has been submitted successfully
    children: (close: () => void) => React.ReactNode;
};

// "Create X" button + dialog holding a form. Owns the open state so pages don't have to
export function FormDialog({
    title,
    description,
    triggerLabel,
    hotkey,
    children,
}: FormDialogProps) {
    const [open, setOpen] = useState(false);
    useHotkey(hotkey, () => setOpen(true));

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    <Button size="lg" className="w-full sm:w-auto">
                        <Plus />
                        {triggerLabel}
                        {hotkey && (
                            <kbd className="ml-1 hidden rounded border border-primary-foreground/30 px-1.5 font-mono text-[0.7rem] leading-4 opacity-80 sm:inline-block">
                                {hotkey.toUpperCase()}
                            </kbd>
                        )}
                    </Button>
                }
            />
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                {children(() => setOpen(false))}
            </DialogContent>
        </Dialog>
    );
}
