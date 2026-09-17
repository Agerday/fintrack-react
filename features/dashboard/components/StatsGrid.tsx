import { StatCard, type StatCardProps } from '@/components/layout/StatCard';

type StatsGridProps = {
    stats: StatCardProps[];
};

export function StatsGrid({ stats }: StatsGridProps) {
    return (
        <div className="grid grid-cols-4 gap-6">
            {stats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
            ))}
        </div>
    );
}
