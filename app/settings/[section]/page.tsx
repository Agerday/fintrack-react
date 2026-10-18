import type { ComponentType } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Construction } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { buttonVariants } from '@/components/ui/button';
import { CompanyForm } from '@/features/company/components/CompanyForm';
import { DemoDataSettings } from '@/features/demo/components/DemoDataSettings';
import { NotificationSettings } from '@/features/notifications/components/NotificationSettings';
import { ProfileForm } from '@/features/profile/components/ProfileForm';
import { AppearanceSettings } from '@/features/settings/components/AppearanceSettings';
import { findSettingsSection, settingsSections } from '@/features/settings/sections';

// Sections without an entry here still show the "Coming soon" placeholder
const sectionForms: Partial<Record<string, ComponentType>> = {
    company: CompanyForm,
    profile: ProfileForm,
    appearance: AppearanceSettings,
    notifications: NotificationSettings,
    demo: DemoDataSettings,
};

export function generateStaticParams() {
    return settingsSections.map(({ id }) => ({ section: id }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ section: string }>;
}): Promise<Metadata> {
    const { section: id } = await params;
    // An unknown section renders the not found page: no section name to show
    return { title: findSettingsSection(id)?.title ?? 'Settings' };
}

export default async function SettingsSectionPage({
    params,
}: {
    params: Promise<{ section: string }>;
}) {
    const { section: id } = await params;
    const section = findSettingsSection(id);
    if (!section) notFound();
    const SectionForm = sectionForms[id];

    return (
        <div className="mx-auto max-w-3xl space-y-6 lg:space-y-8">
            <Link
                href="/settings"
                className={buttonVariants({ variant: 'ghost', className: '-ml-2.5' })}
            >
                <ArrowLeft />
                Back to settings
            </Link>

            <PageHeader title={section.title} description={section.description} />

            {SectionForm ? (
                <SectionForm />
            ) : (
                <EmptyState
                    icon={Construction}
                    title="Coming soon"
                    description="This section is not available yet."
                />
            )}
        </div>
    );
}
