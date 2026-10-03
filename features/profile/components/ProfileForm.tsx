'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FormError, FormField } from '@/components/shared/FormField';
import { QueryState } from '@/components/shared/QueryState';
import { useProfile, useUpdateProfile } from '@/features/profile/hooks';
import { profileSchema } from '@/features/profile/schema';
import type { ProfileFormValues } from '@/features/profile/schema';
import type { Profile } from '@/features/profile/types';
import { ApiError } from '@/lib/api-error';

type ProfileFieldsProps = {
    profile: Profile;
};

function ProfileFields({ profile }: ProfileFieldsProps) {
    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors, isDirty },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: profile,
    });

    const { mutate, isPending, isSuccess, error } = useUpdateProfile();

    function onSubmit(data: ProfileFormValues) {
        mutate(data, {
            onSuccess: (saved) => reset(saved),
            onError: (err) => {
                if (err instanceof ApiError && err.field) {
                    setError(err.field as keyof ProfileFormValues, { message: err.message });
                }
            },
        });
    }

    const globalErrorMessage =
        error instanceof ApiError && !error.field ? error.message : undefined;

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Card>
                <CardContent className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <FormField label="Name" htmlFor="name" error={errors.name?.message}>
                            <Input id="name" autoComplete="name" {...register('name')} />
                        </FormField>
                        <FormField
                            label="Job title"
                            htmlFor="jobTitle"
                            error={errors.jobTitle?.message}
                        >
                            <Input
                                id="jobTitle"
                                autoComplete="organization-title"
                                {...register('jobTitle')}
                            />
                        </FormField>
                        <FormField
                            label="Email"
                            htmlFor="email"
                            error={errors.email?.message}
                            className="sm:col-span-2"
                        >
                            <Input
                                id="email"
                                type="email"
                                autoComplete="email"
                                {...register('email')}
                            />
                        </FormField>
                    </div>
                    <FormError message={globalErrorMessage} />
                </CardContent>

                <CardFooter className="justify-end gap-3 border-t">
                    {isSuccess && !isDirty && (
                        <p
                            role="status"
                            className="flex items-center gap-1.5 text-sm text-muted-foreground"
                        >
                            <CheckCircle2 className="size-4 text-status-paid" />
                            Profile saved
                        </p>
                    )}
                    <Button type="submit" disabled={!isDirty || isPending}>
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
