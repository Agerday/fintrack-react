import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { ClientTable } from './ClientTable';
import { defaultClientListParams } from '../schema';
import { clientDb } from '@/test/msw/handlers/clients';
import { invoiceDb } from '@/test/msw/handlers/invoices';
import { buildClient, buildInvoice } from '@/test/factories';
import { renderWithClient } from '@/test/render';

// jsdom loads no CSS: the mobile cards are in the DOM too, so rows are read from the <table>.
// The first row is the header
async function bodyRows() {
    return within(await screen.findByRole('table'))
        .getAllByRole('row')
        .slice(1);
}

describe('ClientTable', () => {
    it('finds a client by its email or company, not only its name', async () => {
        clientDb.clients = [
            buildClient({ name: 'Ada', email: 'ada@acme.io' }),
            buildClient({ name: 'Grace', company: 'Acme Labs' }),
            buildClient({ name: 'Linus' }),
        ];

        renderWithClient(<ClientTable params={{ ...defaultClientListParams, q: 'acme' }} />);

        const rows = await bodyRows();
        expect(rows).toHaveLength(2);
        expect(rows[0]).toHaveTextContent('Ada');
        expect(rows[1]).toHaveTextContent('Grace');
    });

    it('lists the biggest total first when sorted by total', async () => {
        clientDb.clients = [buildClient({ name: 'Small' }), buildClient({ name: 'Big' })];
        invoiceDb.invoices = [
            buildInvoice({ client: 'Small', amount: 100 }),
            buildInvoice({ client: 'Big', amount: 900 }),
        ];

        renderWithClient(
            <ClientTable params={{ ...defaultClientListParams, sort: 'total', dir: 'desc' }} />,
        );

        const rows = await bodyRows();
        expect(rows[0]).toHaveTextContent('Big');
        expect(rows[1]).toHaveTextContent('Small');
    });
});
