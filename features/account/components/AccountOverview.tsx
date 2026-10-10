'use client';

import Link from 'next/link';
import { ArrowLeftRight } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { QueryState } from '@/components/shared/QueryState';
import { useAccount } from '@/features/account/hooks';
import type { Transaction } from '@/features/account/types';
import { formatCurrency, formatDate, formatSignedCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';

type TransactionListProps = {
    transactions: Transaction[];
};

function TransactionList({ transactions }: TransactionListProps) {
    return (
        <Card className="gap-0 pb-0">
            <CardHeader className="border-b">
                <CardTitle>Transactions</CardTitle>
                <CardDescription>Newest first</CardDescription>
            </CardHeader>

            {transactions.length ? (
                <ul className="divide-y">
                    {transactions.map((transaction) => (
                        <li
                            key={transaction.id}
                            className="flex items-center justify-between gap-4 px-4 py-3"
                        >
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium">{transaction.label}</p>
                                <p className="truncate text-sm text-muted-foreground">
                                    {formatDate(transaction.date)}
                                    {transaction.invoiceId && (
                                        <>
                                            {' · '}
                                            <Link
                                                href={`/invoices/${transaction.invoiceId}`}
                                                className="text-primary hover:underline"
                                            >
                                                {transaction.invoiceId}
                                            </Link>
                                        </>
                                    )}
                                </p>
                            </div>
                            <span
                                className={cn(
                                    'shrink-0 text-sm font-medium tabular-nums',
                                    transaction.amount > 0 && 'text-success',
                                )}
                            >
                                {formatSignedCurrency(transaction.amount)}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <EmptyState
                    icon={ArrowLeftRight}
                    title="No transactions yet"
                    description="Paid invoices are credited here."
                    className="m-4 border-none"
                />
            )}
        </Card>
    );
}

export function AccountOverview() {
    const { data: account, isPending, error, refetch } = useAccount();

    return (
        <QueryState
            isPending={isPending}
            error={error}
            onRetry={() => void refetch()}
            loadingFallback={
                <div className="space-y-6">
                    <Skeleton className="h-28 w-full rounded-xl" />
                    <Skeleton className="h-80 w-full rounded-xl" />
                </div>
            }
        >
            {account && (
                <div className="space-y-6">
                    <Card className="gap-1 p-5 sm:p-6">
                        <p className="text-sm font-medium text-muted-foreground">Available cash</p>
                        <p className="text-3xl font-semibold tracking-tight tabular-nums">
                            {formatCurrency(account.balance)}
                        </p>
                    </Card>
                    <TransactionList transactions={account.transactions} />
                </div>
            )}
        </QueryState>
    );
}
