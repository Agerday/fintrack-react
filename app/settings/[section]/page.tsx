import type { ComponentType } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Construction } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { buttonVariants } from '@/components/ui/button';
import { CompanyForm } from '@/features/company/components/CompanyForm';
import { findSettingsSection, settingsSections } from '@/features/settings/sections';

// Sections without an entry here still show the "Coming soon" placeholder
const sectionForms: Partial<Record<string, ComponentType>> = {
    company: CompanyForm,
};

export function generateStaticParams() {
    return settingsSections.map(({ id }) => ({ section: id }));
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
