import { z } from 'zod';

// List state (search, filters, sort, page) lives in the URL: shareable, survives a reload and the
// back button. Search params arrive as string | string[] | undefined and anyone can edit them,
// so an invalid value falls back to its default instead of failing the page
export const searchParam = z.string().trim().catch('');

export type ListParams = Record<string, string | number>;

export type RawSearchParams = Record<string, string | string[] | undefined>;

// The params that differ from their default: the only ones worth putting in the URL
export function changedParams<T extends ListParams>(params: T, defaults: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(params).filter(([key, value]) => value !== defaults[key]),
    ) as Partial<T>;
}

// "/invoices?q=acme&status=paid", or "/invoices" when everything is at its default
export function listHref<T extends ListParams>(pathname: string, params: T, defaults: T): string {
    const query = new URLSearchParams(
        Object.entries(changedParams(params, defaults)).map(([key, value]) => [key, String(value)]),
    ).toString();
    return query ? `${pathname}?${query}` : pathname;
}

// Case-insensitive "contains" on any of the fields. An empty search matches everything
export function matchesSearch(fields: string[], search: string): boolean {
    const needle = search.toLowerCase();
    return !needle || fields.some((field) => field.toLowerCase().includes(needle));
}
