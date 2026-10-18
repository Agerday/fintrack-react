import type { Invoice } from '@/features/invoices/types';
import { sumAmounts } from '@/lib/money';
import { type ListPage, listLinks, matchesSearch, paginate, sortBy } from '@/lib/list-params';
import { countries } from './countries';
import {
    type ClientFormValues,
    type ClientListParams,
    type ClientSortKey,
    defaultClientListParams,
} from './schema';
import type { Client, ClientRecord } from './types';

export const CLIENTS_PAGE_SIZE = 10;

const sortValues: Record<ClientSortKey, (client: Client) => string | number> = {
    name: (client) => client.name,
    invoices: (client) => client.invoices,
    total: (client) => client.total,
};

// The page of clients the list shows for the URL params, like queryInvoices
export function queryClients(clients: Client[], params: ClientListParams): ListPage<Client> {
    const matching = clients.filter((client) =>
        matchesSearch([client.name, client.email, client.company], params.q),
    );
    const sorted = sortBy(matching, sortValues[params.sort], params.dir);
    return paginate(sorted, params.page, CLIENTS_PAGE_SIZE);
}

// A to Z for the name, most first for the figures
export const { href: clientListHref, sortHref: clientSortHref } = listLinks<
    ClientSortKey,
    ClientListParams
>('/clients', defaultClientListParams, { name: 'asc', invoices: 'desc', total: 'desc' });

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

function clientKey(name: string): string {
    return name.trim().toLowerCase();
}

export type ClientInvoices = { name: string; amounts: number[] };

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
