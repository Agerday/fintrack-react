'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePlacePendingOrder } from '../hooks';
import { orderTotal, pendingOrderLabels, pendingOrderSide } from '../rules';
import { type PendingOrderFormValues, pendingOrderSchema } from '../schema';
import type { Asset, PendingOrderType } from '../types';
import { TicketSummary } from './TicketSummary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormError, FormField, FormSuccess } from '@/components/shared/FormField';
import { MoneyInput } from '@/components/shared/MoneyInput';
import { ApiError } from '@/lib/api-error';
import { formatCurrency } from '@/lib/formatters';

const triggerHints: Record<PendingOrderType, string> = {
    stop_loss: 'Sells when the price drops to this level or below',
    take_profit: 'Sells when the price rises to this level or above',
    buy_limit: 'Buys when the price drops to this level or below',
};

type PendingOrderFormProps = {
    asset: Asset;
    type: PendingOrderType;
    price?: number;
    // Available cash, for a buy limit
    cash?: number;
    held: number;
};

// Stop loss / take profit / buy limit. No default quantity: how much to trade is a deliberate
// choice
export function PendingOrderForm({ asset, type, price, cash, held }: PendingOrderFormProps) {
    const {
        register,
        handleSubmit,
        setError,
        control,
        reset: resetForm,
        formState: { errors },
    } = useForm<PendingOrderFormValues>({
        resolver: zodResolver(pendingOrderSchema),
        defaultValues: { symbol: asset.symbol, type },
    });
    const quantity = useWatch({ control, name: 'quantity' });
    const triggerPrice = useWatch({ control, name: 'triggerPrice' });

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
    const side = pendingOrderSide(type);
    const globalErrorMessage =
        error instanceof ApiError && !error.field ? error.message : undefined;
    // A buy limit reserves its cost at the limit price: the most it can cost
    const reserved =
        Number.isInteger(quantity) && quantity > 0 && triggerPrice > 0
            ? orderTotal(triggerPrice, quantity)
            : undefined;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <FormField
                label={side === 'buy' ? 'Quantity to buy' : 'Quantity to sell'}
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
                label={side === 'buy' ? 'Limit price' : 'Trigger price'}
                htmlFor="trigger-price"
                error={errors.triggerPrice?.message}
                hint={triggerHints[type]}
            >
                <MoneyInput
                    id="trigger-price"
                    {...register('triggerPrice', { valueAsNumber: true })}
                />
            </FormField>

            <TicketSummary
                rows={[
                    {
                        label: 'Market price',
                        value: price === undefined ? '—' : formatCurrency(price),
                    },
                    ...(side === 'buy'
                        ? [
                              {
                                  label: 'Cash reserved',
                                  value: reserved === undefined ? '—' : formatCurrency(reserved),
                                  emphasis: true,
                              },
                              {
                                  label: 'Available cash',
                                  value: cash === undefined ? '—' : formatCurrency(cash),
                              },
                          ]
                        : [{ label: 'You hold', value: `${held} ${asset.symbol}` }]),
                ]}
            />

            <FormError message={globalErrorMessage} />
            <FormSuccess
                message={
                    placed &&
                    `${label} placed: ${side} ${placed.quantity} ${placed.symbol} at ${formatCurrency(placed.triggerPrice)}`
                }
            />

            <Button
                type="submit"
                size="lg"
                disabled={isPending || (side === 'sell' && held === 0)}
                className="w-full"
            >
                {isPending ? 'Placing order...' : `Place ${label.toLowerCase()}`}
            </Button>
        </form>
    );
}
