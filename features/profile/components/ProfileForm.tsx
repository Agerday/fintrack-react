'use client';

import { CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FormField } from '@/components/shared/FormField';
import { QueryState } from '@/components/shared/QueryState';
import { useProfile, useSaveProfile } from '@/features/profile/hooks';
import type { Profile } from '@/features/profile/types';

type ProfileFieldsProps = {
    profile: Profile;
};

// The one form built on a Server Action + useActionState instead of React Hook Form + a Route
// Handler: validation runs on the server only, and the fields are plain uncontrolled inputs
function ProfileFields({ profile }: ProfileFieldsProps) {
    const [state, formAction, isPending] = useSaveProfile(profile);
    const errors = state.fieldErrors ?? {};

    return (
        // React resets the inputs after each submit: defaultValue from the state puts back the
        // saved profile, or what the user typed when the server rejected it
        <form action={formAction} noValidate>
            <Card>
                <CardContent className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <FormField label="Name" htmlFor="name" error={errors.name?.[0]}>
                            <Input
                                id="name"
                                name="name"
                                autoComplete="name"
                                defaultValue={state.values.name}
                            />
                        </FormField>
                        <FormField
                            label="Job title"
                            htmlFor="jobTitle"
                            error={errors.jobTitle?.[0]}
                        >
                            <Input
                                id="jobTitle"
                                name="jobTitle"
                                autoComplete="organization-title"
                                defaultValue={state.values.jobTitle}
                            />
                        </FormField>
                        <FormField
                            label="Email"
                            htmlFor="email"
                            error={errors.email?.[0]}
                            className="sm:col-span-2"
                        >
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                defaultValue={state.values.email}
                            />
                        </FormField>
                    </div>
                </CardContent>

                <CardFooter className="justify-end gap-3 border-t">
                    {state.status === 'success' && !isPending && (
                        <p
                            role="status"
                            className="flex items-center gap-1.5 text-sm text-muted-foreground"
                        >
                            <CheckCircle2 className="size-4 text-status-paid" />
                            Profile saved
                        </p>
                    )}
                    <Button type="submit" disabled={isPending}>
                        {isPending ? 'Saving...' : 'Save changes'}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}

export function ProfileForm() {
    const { data: profile, isPending, error, refetch } = useProfile();

    return (
        <QueryState
            isPending={isPending}
            error={error}
            onRetry={() => void refetch()}
            loadingFallback={<Skeleton className="h-64 w-full rounded-xl" />}
        >
            {profile && <ProfileFields profile={profile} />}
        </QueryState>
    );
}
