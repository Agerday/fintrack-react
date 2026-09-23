import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCheckEmail, useCreateClient } from '@/features/clients/hooks';
import { ClientFormValues, clientSchema } from '@/features/clients/schema';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api-error';
import { ErrorCode, getErrorMessage } from '@/lib/errors';
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
        error instanceof ApiError && error.code !== ErrorCode.CONFLICT
            ? getErrorMessage(error.code, error.field)
            : undefined;

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
                {checkingEmail && (
                    <p className="text-xs text-muted-foreground">Checking availability...</p>
                )}
                {!checkingEmail && emailCheck?.exists && (
                    <p className="text-sm text-destructive">This email is already registered.</p>
                )}
            </div>

            {/*Controller wraps a component that isn't a plain <input> (like Select),
            so React Hook Form can still track its value*/}
            <div className="space-y-1.5">
                <Label>Phone</Label>
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
                    <Input {...register('phone')} placeholder="1012345678" className="flex-1" />
                </div>
                {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="company">Company</Label>
                <Input id="company" {...register('company')} placeholder="Acme Corporation" />
                {errors.company && (
                    <p className="text-sm text-destructive">{errors.company.message}</p>
                )}
            </div>

            {globalErrorMessage && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {globalErrorMessage}
                </p>
            )}

            <Button type={'submit'} disabled={isPending}>
                {isPending ? 'Creating...' : 'Create client'}
            </Button>
        </form>
    );
}
