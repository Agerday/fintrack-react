'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePlacePendingOrder } from '../hooks';
import { pendingOrderLabels } from '../rules';
import { type PendingOrderFormValues, pendingOrderSchema } from '../schema';
import type { Asset, PendingOrderType } from '../types';
import { TicketSummary } from './TicketSummary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormError, FormField, FormSuccess } from '@/components/shared/FormField';
import { ApiError } from '@/lib/api-error';
import { formatAmount, formatCurrency } from '@/lib/formatters';

const triggerHints: Record<PendingOrderType, string> = {
    stop_loss: 'Sells when the price drops to this level or below',
    take_profit: 'Sells when the price rises to this level or above',
};

type PendingOrderFormProps = {
    asset: Asset;
    type: PendingOrderType;
    price?: number;
    held: number;
};

// Stop loss / take profit. No default quantity: how much to sell is a deliberate choice
export function PendingOrderForm({ asset, type, price, held }: PendingOrderFormProps) {
    const {
        register,
        handleSubmit,
        setError,
        reset: resetForm,
        formState: { errors },
    } = useForm<PendingOrderFormValues>({
        resolver: zodResolver(pendingOrderSchema),
        defaultValues: { symbol: asset.symbol, type },
    });

    const { mutate, isPending, error, data: placed } = usePlacePendingOrder();

    function onSubmit(values: PendingOrderFormValues) {
        mutate(values, {
            onSuccess: () => resetForm(),
            onError: (err) => {
                if (err instanceof ApiError && err.field) {
                    setError(err.field as keyof PendingOrderFormValues, { message: err.message });
                }
            },
        });
    }

    const label = pendingOrderLabels[type];
    const globalErrorMessage =
        error instanceof ApiError && !error.field ? error.message : undefined;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <FormField
                label="Quantity to sell"
                htmlFor="pending-quantity"
                error={errors.quantity?.message}
            >
                <Input
                    id="pending-quantity"
                    type="number"
                    inputMode="numeric"
                    step="1"
                    min="1"
                    {...register('quantity', { valueAsNumber: true })}
                />
            </FormField>

            <FormField
                label="Trigger price"
                htmlFor="trigger-price"
                error={errors.triggerPrice?.message}
                hint={triggerHints[type]}
            >
                <div className="relative">
                    <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground">
                        $
                    </span>
                    <Input
                        id="trigger-price"
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="pl-6"
                        {...register('triggerPrice', {
                            valueAsNumber: true,
                            onBlur: (e) => {
                                if (e.target.value) e.target.value = formatAmount(e.target.value);
                            },
                        })}
                    />
                </div>
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
                    placed &&
                    `${label} placed: sell ${placed.quantity} ${placed.symbol} at ${formatCurrency(placed.triggerPrice)}`
                }
            />

            <Button type="submit" size="lg" disabled={isPending || held === 0} className="w-full">
                {isPending ? 'Placing order...' : `Place ${label.toLowerCase()}`}
            </Button>
        </form>
    );
}
