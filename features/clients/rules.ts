import { countries } from './countries';
import type { ClientFormValues } from './schema';
import type { Client } from './types';

// Business rules of clients: pure functions, no React / fetch / store (see invoices/rules.ts)

// Emails are unique whatever their case: John@acme.com and john@acme.com are the same client
export function emailExists(clients: Pick<Client, 'email'>[], email: string): boolean {
    const normalized = email.toLowerCase();
    return clients.some((client) => client.email.toLowerCase() === normalized);
}

export function createClient(data: ClientFormValues, now: Date): Client {
    const country = countries.find((c) => c.code === data.countryCode);
    return {
        id: `CLI-${now.getTime()}`,
        name: data.name,
        email: data.email,
        phone: `${country?.dialCode ?? ''} ${data.phone}`,
        company: data.company,
        invoices: 0,
        total: 0,
    };
}
