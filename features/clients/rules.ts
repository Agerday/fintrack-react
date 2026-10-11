import type { Invoice } from '@/features/invoices/types';
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

type InvoiceStats = { name: string; invoices: number; cents: number };

// A client is whoever invoices are addressed to. Each stored client gets the count and total
// of its invoices (0 without any), and a name only found on invoices becomes a client too,
// with no contact details yet. Totals are summed in cents, like balanceOf in account/rules.ts
export function withInvoiceStats(
    clients: ClientRecord[],
    invoices: Pick<Invoice, 'client' | 'amount'>[],
): Client[] {
    const stats = new Map<string, InvoiceStats>();
    for (const { client, amount } of invoices) {
        const key = clientKey(client);
        const current = stats.get(key) ?? { name: client.trim(), invoices: 0, cents: 0 };
        stats.set(key, {
            ...current,
            invoices: current.invoices + 1,
            cents: current.cents + Math.round(amount * 100),
        });
    }

    const known = clients.map((client) => {
        const own = stats.get(clientKey(client.name));
        return { ...client, invoices: own?.invoices ?? 0, total: (own?.cents ?? 0) / 100 };
    });
    const knownKeys = new Set(clients.map((client) => clientKey(client.name)));
    const invoiceOnly = [...stats]
        .filter(([key]) => !knownKeys.has(key))
        .map(([key, own]) => ({
            id: `invoice-client:${key}`,
            name: own.name,
            email: '',
            phone: '',
            company: '',
            invoices: own.invoices,
            total: own.cents / 100,
        }));
    return [...known, ...invoiceOnly];
}
