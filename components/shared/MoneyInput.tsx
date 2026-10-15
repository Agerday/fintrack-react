import type { ComponentProps, FocusEvent } from 'react';
import { Input } from '@/components/ui/input';
import { formatAmount } from '@/lib/formatters';
import { cn } from '@/lib/utils';

type MoneyInputProps = Omit<ComponentProps<'input'>, 'type'>;

// A dollar amount: "$" prefix, cents keyboard on mobile, and "95" becomes "95.00" on blur.
// Spread register('field', { valueAsNumber: true }) on it like on a plain Input
export function MoneyInput({ className, onBlur, ...props }: MoneyInputProps) {
    function handleBlur(event: FocusEvent<HTMLInputElement>) {
        if (event.target.value) event.target.value = formatAmount(event.target.value);
        onBlur?.(event);
    }

    return (
        <div className="relative">
            <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground">
                $
            </span>
            <Input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="0.00"
                className={cn('pl-6', className)}
                onBlur={handleBlur}
                {...props}
            />
        </div>
    );
}
