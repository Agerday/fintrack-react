import { StatCard, type StatCardProps } from '@/components/layout/StatCard';

type StatsGridProps = {
    stats: StatCardProps[];
};

export function StatsGrid({ stats }: StatsGridProps) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {stats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
            ))}
        </div>
    );
}
