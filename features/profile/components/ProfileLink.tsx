'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfile } from '@/features/profile/hooks';
import { formatInitials } from '@/lib/formatters';

export function ProfileLink() {
    const { data: profile } = useProfile();

    if (!profile) return <Skeleton className="size-9 rounded-full" />;

    return (
        <Link
            href="/profile"
            aria-label="Your profile"
            className="flex items-center gap-2.5 rounded-lg py-1 pr-2 pl-1 transition-colors hover:bg-muted"
        >
            <Avatar className="size-9">
                <AvatarFallback className="bg-accent text-accent-foreground">
                    {formatInitials(profile.name)}
                </AvatarFallback>
            </Avatar>
            <div className="hidden leading-tight sm:block">
                <p className="text-sm font-medium">{profile.name}</p>
                <p className="text-xs text-muted-foreground">{profile.jobTitle}</p>
            </div>
        </Link>
    );
}
