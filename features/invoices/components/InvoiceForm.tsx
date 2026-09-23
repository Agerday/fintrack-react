'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useCreateInvoice } from '@/features/invoices/hooks';
import { ErrorMessage } from '@/lib/errors';
import { ApiError } from '@/lib/api-error';
import { formatAmount } from '@/lib/formatters';

type InvoiceFormProps = {
    onSuccess?: () => void;
};

export function InvoiceForm({ onSuccess }: InvoiceFormProps) {
    const [client, setClient] = useState('');
    const [amount, setAmount] = useState('');
    const { mutate, isPending, error } = useCreateInvoice();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        mutate(
            {
                client,
                date: new Date().toISOString(),
                amount: Number(amount),
                status: 'pending',
            },
            { onSuccess },
        );
    }

    const errorMessage = error instanceof ApiError ? ErrorMessage[error.code] : error?.message;

    return (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-1.5">
                <Label htmlFor="client">Client</Label>
                <Input
                    id="client"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    placeholder="Acme Corporation"
                    required
                />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        $
                    </span>
                    <Input
                        id="amount"
                        type="text"
                        inputMode="decimal"
                        value={amount}
                        onChange={(e) => {
                            const value = e.target.value;

                            if (/^\d*\.?\d*$/.test(value)) {
                                setAmount(value);
                            }
                        }}
                        onBlur={() => {
                            if (amount !== '') {
                                setAmount(formatAmount(amount));
                            }
                        }}
                        placeholder="0.00"
                        className="pl-6"
                        required
                    />
                </div>
            </div>
            {errorMessage && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {errorMessage}
                </p>
            )}
            <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? 'Creating...' : 'Create invoice'}
            </Button>
        </form>
    );
}
