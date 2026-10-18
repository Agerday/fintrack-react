'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { assets } from '../data';
import { useMarketFeed, useOrders, usePendingOrders, usePositions } from '../hooks';
import { availableCash, heldQuantity, portfolioSummary } from '../rules';
import type { Position } from '../types';
import { ConnectionBadge } from '@/components/shared/ConnectionBadge';
import { OrderHistory } from './OrderHistory';
import { OrderTicket } from './OrderTicket';
import { PendingOrdersTable } from './PendingOrdersTable';
import { PnlAmount } from './PnlAmount';
import { PositionsTable } from './PositionsTable';
import { Watchlist } from './Watchlist';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryState } from '@/components/shared/QueryState';
import { useAccount } from '@/features/account/hooks';
import { formatCurrency } from '@/lib/formatters';
import { useMarketPrices, useMarketStatus } from '@/lib/store/useMarketStore';

// Chart.js loads in its own chunk once the desk is on screen: a canvas can't be drawn on the
// server, so there is nothing to render there anyway (see DashboardOverview)
const PriceChart = dynamic(() => import('./PriceChart').then((module) => module.PriceChart), {
    ssr: false,
    loading: () => <Skeleton className="h-88 rounded-xl sm:h-96" />,
});

type SummaryTileProps = {
    label: string;
    children: ReactNode;
};

function SummaryTile({ label, children }: SummaryTileProps) {
    return (
        <Card role="group" aria-label={label} className="gap-1 p-4 sm:p-5">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-lg font-semibold tracking-tight tabular-nums sm:text-xl">
                {children}
            </p>
        </Card>
    );
}

type SectionProps = {
    title: string;
    children: ReactNode;
};

function Section({ title, children }: SectionProps) {
    return (
        <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            {children}
        </section>
    );
}

type PortfolioSummaryProps = {
    positions: Position[];
    cash?: number;
};

// Values the whole portfolio at the live prices: re-renders on every tick, the desk around it
// does not
function PortfolioSummary({ positions, cash }: PortfolioSummaryProps) {
    const summary = portfolioSummary(positions, useMarketPrices());

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-5">
            <SummaryTile label="Available cash">
                {cash === undefined ? '—' : formatCurrency(cash)}
            </SummaryTile>
            <SummaryTile label="Portfolio value">{formatCurrency(summary.value)}</SummaryTile>
            <SummaryTile label="Unrealized P&L">
                <PnlAmount amount={summary.unrealized} />
            </SummaryTile>
            <SummaryTile label="Realized P&L">
                <PnlAmount amount={summary.realized} />
            </SummaryTile>
            <SummaryTile label="Total P&L">
                <PnlAmount amount={summary.total} ratio={summary.totalRatio} />
            </SummaryTile>
        </div>
    );
}

export function TradingDesk() {
    const [symbol, setSymbol] = useState(assets[0].symbol);
    useMarketFeed();
    const status = useMarketStatus();
    const positions = usePositions();
    const orders = useOrders();
    const pendingOrders = usePendingOrders();
    const { data: account } = useAccount();

    // assets is a static, non-empty list and symbol only ever comes from it
    const asset = assets.find((item) => item.symbol === symbol) ?? assets[0];
    // Unknown until both are loaded: the balance alone would show cash the buy limits reserved
    const cash =
        account && pendingOrders.data && availableCash(account.balance, pendingOrders.data);

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <ConnectionBadge status={status} />
            </div>

            <PortfolioSummary positions={positions.data ?? []} cash={cash} />

            <div className="grid gap-6 lg:grid-cols-[18rem_1fr] xl:grid-cols-[18rem_1fr_22rem]">
                <Watchlist selected={symbol} onSelect={setSymbol} />
                <PriceChart
                    asset={asset}
                    pendingOrders={(pendingOrders.data ?? []).filter(
                        (pending) => pending.symbol === symbol,
                    )}
                />
                {/* key: a new asset gets a fresh ticket instead of the previous one's state */}
                <div className="lg:col-span-2 xl:col-span-1">
                    <OrderTicket
                        key={symbol}
                        asset={asset}
                        cash={cash}
                        held={heldQuantity(positions.data ?? [], symbol)}
                    />
                </div>
            </div>

            <Section title="Positions">
                <QueryState
                    isPending={positions.isPending}
                    error={positions.error}
                    onRetry={() => void positions.refetch()}
                >
                    <PositionsTable positions={positions.data ?? []} />
                </QueryState>
            </Section>

            <Section title="Pending orders">
                <QueryState
                    isPending={pendingOrders.isPending}
                    error={pendingOrders.error}
                    onRetry={() => void pendingOrders.refetch()}
                >
                    <PendingOrdersTable pendingOrders={pendingOrders.data ?? []} />
                </QueryState>
            </Section>

            <Section title="Order history">
                <QueryState
                    isPending={orders.isPending}
                    error={orders.error}
                    onRetry={() => void orders.refetch()}
                >
                    <OrderHistory orders={orders.data ?? []} />
                </QueryState>
            </Section>
        </div>
    );
}
