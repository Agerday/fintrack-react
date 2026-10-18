import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { AccountOverview } from '@/features/account/components/AccountOverview';

export const metadata: Metadata = { title: 'Bank account' };

export default function AccountPage() {
    return (
        <div className="mx-auto max-w-3xl space-y-6 lg:space-y-8">
            <PageHeader title="Bank account" description="Your available cash and transactions." />
            <AccountOverview />
        </div>
    );
}
