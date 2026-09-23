'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateClient } from '@/features/clients/hooks';
import { ClientFormValues, clientSchema } from '@/features/clients/schema';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api-error';
import { ErrorMessage } from '@/lib/errors';

export type ClientFormProps = {
    onSuccess?: () => void;
};

export function ClientForm({ onSuccess }: ClientFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ClientFormValues>({ resolver: zodResolver(clientSchema) });

    const { mutate, isPending, error } = useCreateClient();

    function onSubmit(data: ClientFormValues) {
        mutate(data, { onSuccess });
    }

    const errorMessage = error instanceof ApiError ? ErrorMessage[error.code] : error?.message;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register('name')} placeholder="Jane Doe" />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" {...register('email')} placeholder="jane@company.com" />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register('phone')} placeholder="+82 10 1234 5678" />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="company">Company</Label>
                <Input id="company" {...register('company')} placeholder="Acme Corporation" />
                {errors.company && (
                    <p className="text-sm text-destructive">{errors.company.message}</p>
                )}
            </div>

            {errorMessage && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {errorMessage}
                </p>
            )}

            <Button type={'submit'} disabled={isPending}>
                {isPending ? 'Creating...' : 'Create client'}
            </Button>
        </form>
    );
}
