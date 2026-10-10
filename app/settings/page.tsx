import { PageHeader } from '@/components/layout/PageHeader';
import { NavCard } from '@/components/shared/NavCard';
import { settingsSections } from '@/features/settings/sections';

export default function SettingsPage() {
    return (
        <div className="space-y-6 lg:space-y-8">
            <PageHeader title="Settings" description="Configure your company and invoicing." />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {settingsSections.map(({ id, ...section }) => (
                    <NavCard key={id} href={`/settings/${id}`} {...section} />
                ))}
            </div>
        </div>
    );
}
