'use client';

import { useState } from 'react';
import { pendingOrderLabels } from '../rules';
import type { Asset, PendingOrderType } from '../types';
import { MarketOrderForm } from './MarketOrderForm';
import { PendingOrderForm } from './PendingOrderForm';
import { ToggleGroup } from './ToggleGroup';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMarketStatus, useQuote } from '@/lib/store/useMarketStore';

type OrderType = 'market' | PendingOrderType;

type OrderTicketProps = {
    asset: Asset;
    // Bank balance, undefined while loading
    cash?: number;
    held: number;
};

// Remount it with key={symbol} to start fresh on another asset
export function OrderTicket({ asset, cash, held }: OrderTicketProps) {
    const [type, setType] = useState<OrderType>('market');
    const price = useQuote(asset.symbol)?.price;
    const live = useMarketStatus() === 'open';
    // Stop loss and take profit sell what is held: nothing held, nothing to protect
    const canProtect = held > 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Trade {asset.symbol}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <ToggleGroup
                    label="Order type"
                    value={type}
                    onChange={setType}
                    options={[
                        { value: 'market', label: 'Market' },
                        {
                            value: 'stop_loss',
                            label: pendingOrderLabels.stop_loss,
                            disabled: !canProtect,
                        },
                        {
                            value: 'take_profit',
                            label: pendingOrderLabels.take_profit,
                            disabled: !canProtect,
                        },
                    ]}
                />
                {!live && (
                    <p role="status" className="text-sm text-muted-foreground">
                        Prices are paused. Trading resumes when the live feed reconnects.
                    </p>
                )}
                {/* A disabled fieldset disables every input and button inside: no order goes
                    out on a price the user can no longer trust */}
                <fieldset disabled={!live} className="min-w-0">
                    {type === 'market' && (
                        <MarketOrderForm asset={asset} price={price} cash={cash} held={held} />
                    )}
                    {type !== 'market' && (
                        // key: switching type starts a fresh form
                        <PendingOrderForm
                            key={type}
                            asset={asset}
                            type={type}
                            price={price}
                            held={held}
                        />
                    )}
                </fieldset>
            </CardContent>
        </Card>
    );
}
