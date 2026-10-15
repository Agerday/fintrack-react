'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePlaceOcoOrder } from '../hooks';
import { type OcoOrderFormValues, ocoOrderSchema } from '../schema';
import type { Asset } from '../types';
import { TicketSummary } from './TicketSummary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormError, FormField, FormSuccess } from '@/components/shared/FormField';
import { MoneyInput } from '@/components/shared/MoneyInput';
import { ApiError } from '@/lib/api-error';
import { formatCurrency } from '@/lib/formatters';

type OcoOrderFormProps = {
    asset: Asset;
    price?: number;
    held: number;
};

// A stop loss and a take profit on the same units, placed together: the first to fire
// cancels the other, so the position is never sold twice
export function OcoOrderForm({ asset, price, held }: OcoOrderFormProps) {
    const {
        register,
        handleSubmit,
        setError,
        reset: resetForm,
        formState: { errors },
    } = useForm<OcoOrderFormValues>({
        resolver: zodResolver(ocoOrderSchema),
        defaultValues: { symbol: asset.symbol },
    });

    const { mutate, isPending, error, data: placed } = usePlaceOcoOrder();

    function onSubmit(values: OcoOrderFormValues) {
        mutate(values, {
            onSuccess: () => resetForm(),
            onError: (err) => {
                if (err instanceof ApiError && err.field) {
                    setError(err.field as keyof OcoOrderFormValues, { message: err.message });
                }
            },
        });
    }

    const globalErrorMessage =
        error instanceof ApiError && !error.field ? error.message : undefined;
    const [stop, target] = placed ?? [];

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <FormField
                label="Quantity to sell"
                htmlFor="oco-quantity"
                error={errors.quantity?.message}
            >
                <Input
                    id="oco-quantity"
                    type="number"
                    inputMode="numeric"
                    step="1"
                    min="1"
                    {...register('quantity', { valueAsNumber: true })}
                />
            </FormField>

            <FormField
                label="Stop loss price"
                htmlFor="oco-stop-price"
                error={errors.stopPrice?.message}
                hint="Sells if the price drops to this level"
            >
                <MoneyInput
                    id="oco-stop-price"
                    {...register('stopPrice', { valueAsNumber: true })}
                />
            </FormField>

            <FormField
                label="Take profit price"
                htmlFor="oco-target-price"
                error={errors.targetPrice?.message}
                hint="Sells if the price rises to this level"
            >
                <MoneyInput
                    id="oco-target-price"
                    {...register('targetPrice', { valueAsNumber: true })}
                />
            </FormField>

            <TicketSummary
                rows={[
                    {
                        label: 'Market price',
                        value: price === undefined ? '—' : formatCurrency(price),
                    },
                    { label: 'You hold', value: `${held} ${asset.symbol}` },
                ]}
            />

            <FormError message={globalErrorMessage} />
            <FormSuccess
                message={
                    stop &&
                    target &&
                    `OCO placed: sell ${stop.quantity} ${stop.symbol} at ${formatCurrency(stop.triggerPrice)} or ${formatCurrency(target.triggerPrice)}`
                }
            />

            <Button type="submit" size="lg" disabled={isPending || held === 0} className="w-full">
                {isPending ? 'Placing order...' : 'Place OCO'}
            </Button>
        </form>
    );
}
