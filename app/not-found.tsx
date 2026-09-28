import Link from 'next/link';
import { SearchX } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';

export default function NotFound() {
    return (
        <EmptyState
            icon={SearchX}
            title="Page not found"
            description="The page you are looking for does not exist."
            className="mt-8 py-16"
            action={
                <Link href="/" className={buttonVariants()}>
                    Back to dashboard
                </Link>
            }
        />
    );
}
