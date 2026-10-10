import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type NavCardTone = 'chart-1' | 'chart-2' | 'chart-3' | 'chart-4' | 'chart-5';

const toneClasses: Record<NavCardTone, { icon: string; title: string; card: string }> = {
    'chart-1': {
        icon: 'bg-chart-1/10 text-chart-1',
        title: 'text-chart-1',
        card: 'hover:bg-chart-1/5',
    },
    'chart-2': {
        icon: 'bg-chart-2/10 text-chart-2',
        title: 'text-chart-2',
        card: 'hover:bg-chart-2/5',
    },
    'chart-3': {
        icon: 'bg-chart-3/10 text-chart-3',
        title: 'text-chart-3',
        card: 'hover:bg-chart-3/5',
    },
    'chart-4': {
        icon: 'bg-chart-4/10 text-chart-4',
        title: 'text-chart-4',
        card: 'hover:bg-chart-4/5',
    },
    'chart-5': {
        icon: 'bg-chart-5/10 text-chart-5',
        title: 'text-chart-5',
        card: 'hover:bg-chart-5/5',
    },
};

type NavCardProps = {
    href: string;
    icon: LucideIcon;
    title: string;
    description: string;
    tone?: NavCardTone;
};

export function NavCard({ href, icon: Icon, title, description, tone = 'chart-1' }: NavCardProps) {
    const classes = toneClasses[tone];

    return (
        <Link
            href={href}
            className={cn(
                'group flex flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center shadow-sm outline-none',
                'transition duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:ring-3 focus-visible:ring-ring/50',
                // Respect the OS "reduce motion" setting: keep the color change, drop the movement
                'motion-reduce:transition-colors motion-reduce:hover:translate-y-0',
                classes.card,
            )}
        >
            <span
                className={cn(
                    'flex size-12 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110 motion-reduce:group-hover:scale-100',
                    classes.icon,
                )}
            >
                <Icon className="size-6" />
            </span>
            <span className={cn('text-base font-semibold', classes.title)}>{title}</span>
            <span className="text-sm text-muted-foreground">{description}</span>
        </Link>
    );
}
