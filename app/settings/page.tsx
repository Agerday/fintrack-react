import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { NavCard } from '@/components/shared/NavCard';
import { settingsSections } from '@/features/settings/sections';

export const metadata: Metadata = { title: 'Settings' };

export default function SettingsPage() {
    return (
        <div className="space-y-6 lg:space-y-8">
            <PageHeader
                title="Settings"
                description="Your company, your profile and how FinTrack behaves."
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {settingsSections.map(({ id, ...section }) => (
                    <NavCard key={id} href={`/settings/${id}`} {...section} />
                ))}
            </div>
        </div>
    );
}
