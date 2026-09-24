import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
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
            <div className="space-y-1.5">
                <Label htmlFor="client">Client</Label>
                <Input id="client" {...register('client')} placeholder="Acme Corporation" />
                {errors.client && (
                    <p className="text-sm text-destructive">{errors.client.message}</p>
                )}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
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
                {errors.amount && (
                    <p className="text-sm text-destructive">{errors.amount.message}</p>
                )}
            </div>

            {globalErrorMessage && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {globalErrorMessage}
                </p>
            )}

            <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? 'Creating...' : 'Create invoice'}
            </Button>
        </form>
    );
}
