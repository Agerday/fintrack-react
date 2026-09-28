import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type FormFieldProps = {
    label: string;
    // id of the control, links the <label> to it (omit when the control is a group, e.g. phone)
    htmlFor?: string;
    error?: string;
    hint?: React.ReactNode;
    className?: string;
    children: React.ReactNode;
};

// Label + control + error message: the block every form field repeats
export function FormField({ label, htmlFor, error, hint, className, children }: FormFieldProps) {
    return (
        <div className={cn('space-y-1.5', className)}>
            <Label htmlFor={htmlFor}>{label}</Label>
            {children}
            {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
}

type FormErrorProps = {
    message?: string;
};

// Global (non-field) API error, shown above the submit button
export function FormError({ message }: FormErrorProps) {
    if (!message) return null;

    return (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {message}
        </p>
    );
}
