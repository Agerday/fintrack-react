import type { Invoice } from '@/features/invoices/types';
import { sumAmounts } from '@/lib/money';
import { countries } from './countries';
import type { ClientFormValues } from './schema';
import type { Client, ClientRecord } from './types';

// Business rules of clients: pure functions, no React / fetch / store (see invoices/rules.ts)

// Emails are unique whatever their case: John@acme.com and john@acme.com are the same client
export function emailExists(clients: Pick<ClientRecord, 'email'>[], email: string): boolean {
    const normalized = email.toLowerCase();
    return clients.some((client) => client.email.toLowerCase() === normalized);
}

export function createClient(data: ClientFormValues, now: Date): ClientRecord {
    const country = countries.find((c) => c.code === data.countryCode);
    return {
        id: `CLI-${now.getTime()}`,
        name: data.name,
        email: data.email,
        phone: `${country?.dialCode ?? ''} ${data.phone}`,
        company: data.company,
    };
}

// An invoice only stores the client name as typed: "Acme" and " acme " are the same client
function clientKey(name: string): string {
    return name.trim().toLowerCase();
}

export type ClientInvoices = { name: string; amounts: number[] };

// The invoice amounts of each client, keyed by clientKey, with the name as first written.
// Shared by the clients page and the dashboard, so both always agree on who a client is
export function groupByClient(
    invoices: Pick<Invoice, 'client' | 'amount'>[],
): Map<string, ClientInvoices> {
    const groups = new Map<string, ClientInvoices>();
    for (const { client, amount } of invoices) {
        const key = clientKey(client);
        const group = groups.get(key) ?? { name: client.trim(), amounts: [] };
        groups.set(key, { ...group, amounts: [...group.amounts, amount] });
    }
    return groups;
}

// A client is whoever invoices are addressed to. Each stored client gets the count and total
// of its invoices (0 without any), and a name only found on invoices becomes a client too,
// with no contact details yet
export function withInvoiceStats(
    clients: ClientRecord[],
    invoices: Pick<Invoice, 'client' | 'amount'>[],
): Client[] {
    const groups = groupByClient(invoices);

    const known = clients.map((client) => {
        const amounts = groups.get(clientKey(client.name))?.amounts ?? [];
        return { ...client, invoices: amounts.length, total: sumAmounts(amounts) };
    });
    const knownKeys = new Set(clients.map((client) => clientKey(client.name)));
    const invoiceOnly = [...groups]
        .filter(([key]) => !knownKeys.has(key))
        .map(([key, { name, amounts }]) => ({
            id: `invoice-client:${key}`,
            name,
            email: '',
            phone: '',
            company: '',
            invoices: amounts.length,
            total: sumAmounts(amounts),
        }));
    return [...known, ...invoiceOnly];
}
