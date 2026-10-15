'use client';

import { useState } from 'react';
import { pendingOrderLabels } from '../rules';
import type { Asset, PendingOrderType } from '../types';
import { MarketOrderForm } from './MarketOrderForm';
import { PendingOrderForm } from './PendingOrderForm';
import { ToggleGroup } from './ToggleGroup';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type OrderType = 'market' | PendingOrderType;

type OrderTicketProps = {
    asset: Asset;
    // Live price, undefined until the first tick arrives
    price?: number;
    cash?: number;
    held: number;
};

// Remount it with key={symbol} to start fresh on another asset
export function OrderTicket({ asset, price, cash, held }: OrderTicketProps) {
    const [type, setType] = useState<OrderType>('market');
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
                {type === 'market' ? (
                    <MarketOrderForm asset={asset} price={price} cash={cash} held={held} />
                ) : (
                    // key: switching type starts a fresh form
                    <PendingOrderForm
                        key={type}
                        asset={asset}
                        type={type}
                        price={price}
                        held={held}
                    />
                )}
            </CardContent>
        </Card>
    );
}
