import { describe, expect, it } from 'vitest';
import { createClient, emailExists, withInvoiceStats } from './rules';
import { buildClient, buildInvoice } from '@/test/factories';

describe('emailExists', () => {
    it('finds an email whatever its case', () => {
        const clients = [buildClient({ email: 'john@acme.com' })];

        expect(emailExists(clients, 'John@ACME.com')).toBe(true);
    });

    it('returns false for an unknown email', () => {
        const clients = [buildClient({ email: 'john@acme.com' })];

        expect(emailExists(clients, 'jane@acme.com')).toBe(false);
    });
});

describe('createClient', () => {
    it('prefixes the phone with the dial code of the country', () => {
        const client = createClient(
            {
                name: 'John',
                email: 'john@acme.com',
                countryCode: 'BE',
                phone: '470123456',
                company: 'Acme',
            },
            new Date(),
        );

        expect(client.phone).toBe('+32 470123456');
    });
});

describe('withInvoiceStats', () => {
    it('counts and totals the invoices of a client, whatever the case and spacing of its name', () => {
        const acme = buildClient({ name: 'Acme' });
        const invoices = [
            buildInvoice({ client: 'Acme', amount: 0.1 }),
            buildInvoice({ client: ' acme ', amount: 0.2 }),
            buildInvoice({ client: 'Globex', amount: 500 }),
        ];

        const [client] = withInvoiceStats([acme], invoices);

        expect(client).toEqual({ ...acme, invoices: 2, total: 0.3 });
    });

    it('shows a client without invoices with nothing invoiced', () => {
        const acme = buildClient({ name: 'Acme' });

        expect(withInvoiceStats([acme], [])).toEqual([{ ...acme, invoices: 0, total: 0 }]);
    });

    it('adds a name only found on invoices as a client without contact details', () => {
        const invoices = [
            buildInvoice({ client: 'Pied Piper', amount: 100 }),
            buildInvoice({ client: 'pied piper', amount: 50 }),
        ];

        expect(withInvoiceStats([], invoices)).toEqual([
            expect.objectContaining({ name: 'Pied Piper', email: '', invoices: 2, total: 150 }),
        ]);
    });
});
