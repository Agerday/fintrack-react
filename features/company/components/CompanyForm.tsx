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
import { useCompany, useUpdateCompany } from '@/features/company/hooks';
import { companySchema } from '@/features/company/schema';
import type { CompanyFormValues } from '@/features/company/schema';
import type { Company } from '@/features/company/types';
import { ApiError } from '@/lib/api-error';
import { cn } from '@/lib/utils';

type CompanyField = {
    name: keyof CompanyFormValues;
    label: string;
    autoComplete: string;
    wide?: boolean;
};

const fields: CompanyField[] = [
    { name: 'name', label: 'Company name', autoComplete: 'organization' },
    { name: 'vatNumber', label: 'VAT number', autoComplete: 'off' },
    { name: 'address', label: 'Address', autoComplete: 'street-address', wide: true },
    { name: 'postalCode', label: 'Postal code', autoComplete: 'postal-code' },
    { name: 'city', label: 'City', autoComplete: 'address-level2' },
    { name: 'country', label: 'Country', autoComplete: 'country-name' },
];

type CompanyFieldsProps = {
    company: Company;
};

function CompanyFields({ company }: CompanyFieldsProps) {
    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors, isDirty },
    } = useForm<CompanyFormValues>({
        resolver: zodResolver(companySchema),
        defaultValues: company,
    });

    const { mutate, isPending, isSuccess, error } = useUpdateCompany();

    function onSubmit(data: CompanyFormValues) {
        mutate(data, {
            onSuccess: (saved) => reset(saved),
            onError: (err) => {
                if (err instanceof ApiError && err.field) {
                    setError(err.field as keyof CompanyFormValues, { message: err.message });
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
                        {fields.map(({ name, label, autoComplete, wide }) => (
                            <FormField
                                key={name}
                                label={label}
                                htmlFor={name}
                                error={errors[name]?.message}
                                className={cn(wide && 'sm:col-span-2')}
                            >
                                <Input id={name} autoComplete={autoComplete} {...register(name)} />
                            </FormField>
                        ))}
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
                            Company saved
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

export function CompanyForm() {
    const { data: company, isPending, error, refetch } = useCompany();

    return (
        <QueryState
            isPending={isPending}
            error={error}
            onRetry={() => void refetch()}
            loadingFallback={<Skeleton className="h-80 w-full rounded-xl" />}
        >
            {company && <CompanyFields company={company} />}
        </QueryState>
    );
}
