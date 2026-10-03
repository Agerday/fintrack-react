'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();

    return (
        <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle dark mode"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        >
            {/* Icon picked by CSS, not by resolvedTheme: the server doesn't know the theme,
                so rendering from it would mismatch on hydration */}
            <Sun className="dark:hidden" />
            <Moon className="hidden dark:block" />
        </Button>
    );
}
