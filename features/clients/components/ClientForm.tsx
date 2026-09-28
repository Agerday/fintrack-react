import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCheckEmail, useCreateClient } from '@/features/clients/hooks';
import { ClientFormValues, clientSchema } from '@/features/clients/schema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormError, FormField } from '@/components/shared/FormField';
import { ApiError } from '@/lib/api-error';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { countries } from '@/features/clients/countries';
import { useDebounce } from '@/hooks/useDebounce';

export type ClientFormProps = {
    onSuccess?: () => void;
};

export function ClientForm({ onSuccess }: ClientFormProps) {
    const {
        register,
        control,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<ClientFormValues>({
        resolver: zodResolver(clientSchema),
        defaultValues: { countryCode: 'KR', company: 'TOP COMPANY' },
    });

    const { mutate, isPending, error } = useCreateClient();

    const emailValue = useWatch({ control, name: 'email', defaultValue: '' });
    const debouncedEmail = useDebounce(emailValue, 500);
    const { data: emailCheck, isFetching: checkingEmail } = useCheckEmail(debouncedEmail);

    function onSubmit(data: ClientFormValues) {
        if (emailCheck?.exists) return;
        mutate(data, {
            onSuccess,
            onError: (err) => {
                if (err instanceof ApiError && err.field) {
                    setError(err.field as keyof ClientFormValues, { message: err.message });
                }
            },
        });
    }

    const globalErrorMessage =
        error instanceof ApiError && !error.field ? error.message : undefined;

    // The async "already registered" check is shown like a regular field error
    const emailError =
        errors.email?.message ??
        (!checkingEmail && emailCheck?.exists ? 'This email is already registered.' : undefined);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <FormField label="Name" htmlFor="name" error={errors.name?.message}>
                <Input id="name" {...register('name')} placeholder="Jane Doe" />
            </FormField>

            <FormField
                label="Email"
                htmlFor="email"
                error={emailError}
                hint={checkingEmail && 'Checking availability...'}
            >
                <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="jane@company.com"
                />
            </FormField>

            {/*Controller wraps a component that isn't a plain <input> (like Select),
            so React Hook Form can still track its value*/}
            <FormField label="Phone" error={errors.phone?.message}>
                <div className="flex gap-2">
                    <Controller
                        control={control}
                        name="countryCode"
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="w-[110px] shrink-0">
                                    <SelectValue>
                                        {(() => {
                                            const selected = countries.find(
                                                (c) => c.code === field.value,
                                            );
                                            return selected
                                                ? `${selected.code} ${selected.dialCode}`
                                                : 'Select';
                                        })()}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="min-w-[160px]">
                                    {countries.map((c) => (
                                        <SelectItem key={c.code} value={c.code}>
                                            <span className="flex w-full items-center justify-between gap-3">
                                                <span className="font-medium">{c.code}</span>
                                                <span className="text-muted-foreground">
                                                    {c.dialCode}
                                                </span>
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    <Input
                        {...register('phone')}
                        type="tel"
                        aria-label="Phone number"
                        placeholder="1012345678"
                        className="min-w-0 flex-1"
                    />
                </div>
            </FormField>

            <FormField label="Company" htmlFor="company" error={errors.company?.message}>
                <Input id="company" {...register('company')} placeholder="Acme Corporation" />
            </FormField>

            <FormError message={globalErrorMessage} />

            <Button type="submit" size="lg" disabled={isPending} className="w-full">
                {isPending ? 'Creating...' : 'Create client'}
            </Button>
        </form>
    );
}
