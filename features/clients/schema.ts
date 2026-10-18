import { z } from 'zod';
import { countries, type CountryCode } from '@/features/clients/countries';
import { pageParam, type RawSearchParams, searchParam, sortParams } from '@/lib/list-params';

const countryCodes = countries.map((c) => c.code) as [CountryCode, ...CountryCode[]];

export const clientSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.email('Enter a valid email address'),
    countryCode: z.enum(countryCodes, { message: 'select a country' }),
    phone: z.string().min(4, 'Enter a valid phone number').regex(/^\d+$/, 'Digits only'),
    company: z.string().min(1, 'Company is required'),
});

export type ClientFormValues = z.infer<typeof clientSchema>;

export const clientSortKeys = ['name', 'invoices', 'total'] as const;

export type ClientSortKey = (typeof clientSortKeys)[number];

// The client list state read from the URL (?q=acme&sort=total&page=2), see lib/list-params.ts.
// A to Z by default
export const clientListParamsSchema = z.object({
    q: searchParam,
    ...sortParams(clientSortKeys, 'name', 'asc'),
    page: pageParam,
});

export type ClientListParams = z.infer<typeof clientListParamsSchema>;

export const defaultClientListParams = clientListParamsSchema.parse({});

export function parseClientListParams(searchParams: RawSearchParams): ClientListParams {
    return clientListParamsSchema.parse(searchParams);
}
