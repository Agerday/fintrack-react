import { PageHeader } from '@/components/layout/PageHeader';
import { ProfileForm } from '@/features/profile/components/ProfileForm';

export default function ProfilePage() {
    return (
        <div className="mx-auto max-w-3xl space-y-6 lg:space-y-8">
            <PageHeader title="Profile" description="Your personal information." />
            <ProfileForm />
        </div>
    );
}
