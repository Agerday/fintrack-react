'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePlaceOrder } from '../hooks';
import { orderTotal } from '../rules';
import { type OrderFormValues, orderSchema } from '../schema';
import type { Asset, TradeSide } from '../types';
import { ToggleGroup } from './ToggleGroup';
import { TicketSummary } from './TicketSummary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormError, FormField, FormSuccess } from '@/components/shared/FormField';
import { ApiError } from '@/lib/api-error';
import { formatCurrency } from '@/lib/formatters';

const sideLabels: Record<TradeSide, string> = { buy: 'Buy', sell: 'Sell' };

type MarketOrderFormProps = {
    asset: Asset;
    // Live price, undefined until the first tick arrives
    price?: number;
    cash?: number;
    held: number;
};

// Buys or sells at once, at the live price
export function MarketOrderForm({ asset, price, cash, held }: MarketOrderFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        setError,
        control,
        formState: { errors },
    } = useForm<OrderFormValues>({
        resolver: zodResolver(orderSchema),
        defaultValues: { symbol: asset.symbol, side: 'buy', quantity: 1 },
    });
    const side = useWatch({ control, name: 'side' });
    const quantity = useWatch({ control, name: 'quantity' });

    const { mutate, isPending, error, data: lastOrder, reset } = usePlaceOrder();

    function onSubmit(values: OrderFormValues) {
        mutate(values, {
            onError: (err) => {
                if (err instanceof ApiError && err.field) {
                    setError(err.field as keyof OrderFormValues, { message: err.message });
                }
            },
        });
    }

    // Indicative only: the API fills the order at the price it has when the request lands
    const estimate =
        price !== undefined && Number.isInteger(quantity) && quantity > 0
            ? orderTotal(price, quantity)
            : undefined;
    const canSell = held > 0;
    const globalErrorMessage =
        error instanceof ApiError && !error.field ? error.message : undefined;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <ToggleGroup
                label="Side"
                value={side}
                onChange={(value) => {
                    setValue('side', value);
                    reset();
                }}
                options={[
                    { value: 'buy', label: 'Buy' },
                    // Nothing to sell: block it instead of letting the API refuse the order
                    { value: 'sell', label: 'Sell', disabled: !canSell, tone: 'destructive' },
                ]}
            />

            <FormField
                label="Quantity"
                htmlFor="quantity"
                error={errors.quantity?.message}
                hint={side === 'sell' ? `You hold ${held} ${asset.symbol}` : undefined}
            >
                <Input
                    id="quantity"
                    type="number"
                    inputMode="numeric"
                    step="1"
                    min="1"
                    {...register('quantity', { valueAsNumber: true })}
                />
            </FormField>

            <TicketSummary
                rows={[
                    {
                        label: 'Market price',
                        value: price === undefined ? '—' : formatCurrency(price),
                    },
                    {
                        label: 'Estimated total',
                        value: estimate === undefined ? '—' : formatCurrency(estimate),
                        emphasis: true,
                    },
                    {
                        label: 'Available cash',
                        value: cash === undefined ? '—' : formatCurrency(cash),
                    },
                ]}
            />

            <FormError message={globalErrorMessage} />
            <FormSuccess
                message={
                    lastOrder &&
                    `${lastOrder.side === 'buy' ? 'Bought' : 'Sold'} ${lastOrder.quantity} ${lastOrder.symbol} at ${formatCurrency(lastOrder.price)}`
                }
            />

            <Button
                type="submit"
                size="lg"
                disabled={isPending || (side === 'sell' && !canSell)}
                className="w-full"
            >
                {isPending ? 'Placing order...' : `${sideLabels[side]} ${asset.symbol}`}
            </Button>
        </form>
    );
}
