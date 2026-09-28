import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormError, FormField } from '@/components/shared/FormField';
import { useCreateInvoice } from '@/features/invoices/hooks';
import { InvoiceFormValues, invoiceSchema } from '@/features/invoices/schema';
import { ApiError } from '@/lib/api-error';
import { formatAmount } from '@/lib/formatters';

type InvoiceFormProps = {
    onSuccess?: () => void;
};

export function InvoiceForm({ onSuccess }: InvoiceFormProps) {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<InvoiceFormValues>({
        resolver: zodResolver(invoiceSchema),
    });

    const { mutate, isPending, error } = useCreateInvoice();

    function onSubmit(data: InvoiceFormValues) {
        mutate(data, {
            onSuccess,
            onError: (err) => {
                if (err instanceof ApiError && err.field) {
                    setError(err.field as keyof InvoiceFormValues, { message: err.message });
                }
            },
        });
    }

    const globalErrorMessage =
        error instanceof ApiError && !error.field ? error.message : undefined;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <FormField label="Client" htmlFor="client" error={errors.client?.message}>
                <Input id="client" {...register('client')} placeholder="Acme Corporation" />
            </FormField>

            <FormField label="Amount" htmlFor="amount" error={errors.amount?.message}>
                <div className="relative">
                    <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground">
                        $
                    </span>
                    <Input
                        id="amount"
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        {...register('amount', {
                            valueAsNumber: true,
                            onBlur: (e) => {
                                if (e.target.value) e.target.value = formatAmount(e.target.value);
                            },
                        })}
                        placeholder="0.00"
                        className="pl-6"
                    />
                </div>
            </FormField>

            <FormError message={globalErrorMessage} />

            <Button type="submit" size="lg" disabled={isPending} className="w-full">
                {isPending ? 'Creating...' : 'Create invoice'}
            </Button>
        </form>
    );
}
