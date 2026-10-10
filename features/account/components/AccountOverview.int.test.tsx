import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { AccountOverview } from './AccountOverview';
import { accountDb } from '@/test/msw/handlers/account';
import { buildTransaction } from '@/test/factories';
import { renderWithClient } from '@/test/render';

describe('AccountOverview', () => {
    it('shows the available cash and each transaction linked to its invoice', async () => {
        accountDb.transactions = [
            buildTransaction({ label: 'Payment from Acme', amount: 2400, invoiceId: 'INV-001' }),
            buildTransaction({ label: 'Payment from Globex', amount: 1850.5 }),
        ];

        renderWithClient(<AccountOverview />);

        expect(await screen.findByText('$4,250.50')).toBeInTheDocument();
        expect(screen.getByText('Payment from Acme')).toBeInTheDocument();
        expect(screen.getByText('+$2,400.00')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'INV-001' })).toHaveAttribute(
            'href',
            '/invoices/INV-001',
        );
    });

    it('shows an empty state and a zero balance when nothing was paid yet', async () => {
        renderWithClient(<AccountOverview />);

        expect(await screen.findByText('No transactions yet')).toBeInTheDocument();
        expect(screen.getByText('$0.00')).toBeInTheDocument();
    });
});
