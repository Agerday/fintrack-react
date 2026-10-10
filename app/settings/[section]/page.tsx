import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Construction } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { buttonVariants } from '@/components/ui/button';
import { findSettingsSection, settingsSections } from '@/features/settings/sections';

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

            <EmptyState
                icon={Construction}
                title="Coming soon"
                description="This section is not available yet."
            />
        </div>
    );
}
