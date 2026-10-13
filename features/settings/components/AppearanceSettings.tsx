'use client';

import { useSyncExternalStore } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
];

function subscribe() {
    return () => {};
}

export function AppearanceSettings() {
    const { theme, setTheme } = useTheme();
    // false on the server and during hydration, true after: the server doesn't know the theme,
    // so no option is checked until the client takes over (same reason as ThemeToggle)
    const isClient = useSyncExternalStore(
        subscribe,
        () => true,
        () => false,
    );

    return (
        <Card>
            <CardContent>
                <RadioGroup
                    aria-label="Theme"
                    value={isClient ? theme : null}
                    onValueChange={(value) => setTheme(String(value))}
                    className="grid-cols-1 sm:grid-cols-3"
                >
                    {themes.map(({ value, label, icon: Icon }) => (
                        <Label
                            key={value}
                            className="cursor-pointer justify-between rounded-lg border p-4 has-data-checked:border-primary has-data-checked:bg-primary/5"
                        >
                            <span className="flex items-center gap-2">
                                <Icon className="size-4 text-muted-foreground" />
                                {label}
                            </span>
                            <RadioGroupItem value={value} />
                        </Label>
                    ))}
                </RadioGroup>
            </CardContent>
        </Card>
    );
}
