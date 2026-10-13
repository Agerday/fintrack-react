import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { DemoDataSettings } from './DemoDataSettings';
import { server } from '@/test/msw/server';
import { invoiceDb } from '@/test/msw/handlers/invoices';
import { buildInvoice } from '@/test/factories';
import { renderWithClient } from '@/test/render';

describe('DemoDataSettings', () => {
    it('restores the demo data when the user confirms', async () => {
        invoiceDb.invoices = [buildInvoice()];
        const { user } = renderWithClient(<DemoDataSettings />);

        await user.click(screen.getByRole('button', { name: 'Reset demo data' }));
        await user.click(await screen.findByRole('button', { name: 'Reset' }));

        expect(await screen.findByRole('status')).toHaveTextContent('Demo data restored');
        expect(invoiceDb.invoices).toEqual([]);
    });

    it('keeps the data when the user cancels', async () => {
        invoiceDb.invoices = [buildInvoice()];
        const { user } = renderWithClient(<DemoDataSettings />);

        await user.click(screen.getByRole('button', { name: 'Reset demo data' }));
        await user.click(await screen.findByRole('button', { name: 'Cancel' }));

        expect(invoiceDb.invoices).toHaveLength(1);
    });

    it('shows the error when the reset fails', async () => {
        server.use(
            http.post('/api/demo/reset', () =>
                HttpResponse.json({ message: 'Internal error' }, { status: 500 }),
            ),
        );
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const { user } = renderWithClient(<DemoDataSettings />);

        await user.click(screen.getByRole('button', { name: 'Reset demo data' }));
        await user.click(await screen.findByRole('button', { name: 'Reset' }));

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Something went wrong on our end.',
        );
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
});
