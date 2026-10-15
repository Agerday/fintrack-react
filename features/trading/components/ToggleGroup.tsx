import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ToggleOption<T extends string> = {
    value: T;
    label: string;
    disabled?: boolean;
    // Selected look: primary, or red for a sell-like choice
    tone?: 'default' | 'destructive';
};

type ToggleGroupProps<T extends string> = {
    // Accessible name of the group, e.g. "Side"
    label: string;
    options: ToggleOption<T>[];
    value: T;
    onChange: (value: T) => void;
};

// Segmented buttons, one pressed at a time (aria-pressed): the side and the order type
export function ToggleGroup<T extends string>({
    label,
    options,
    value,
    onChange,
}: ToggleGroupProps<T>) {
    return (
        <div
            role="group"
            aria-label={label}
            className={cn('grid gap-2', options.length === 2 ? 'grid-cols-2' : 'grid-cols-3')}
        >
            {options.map((option) => (
                <Button
                    key={option.value}
                    type="button"
                    size="sm"
                    variant={
                        option.value !== value
                            ? 'outline'
                            : option.tone === 'destructive'
                              ? 'destructive'
                              : 'default'
                    }
                    aria-pressed={option.value === value}
                    disabled={option.disabled}
                    onClick={() => onChange(option.value)}
                >
                    {option.label}
                </Button>
            ))}
        </div>
    );
}
