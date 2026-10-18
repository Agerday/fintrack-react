import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { TradingDesk } from '@/features/trading/components/TradingDesk';

export const metadata: Metadata = { title: 'Live trading' };

export default function TradingPage() {
    return (
        <div className="space-y-6 lg:space-y-8">
            <PageHeader
                title="Live trading"
                description="Simulated market: buy and sell with the cash of your bank account."
            />
            <TradingDesk />
        </div>
    );
}
