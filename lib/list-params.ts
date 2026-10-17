import { z } from 'zod';

// List state (search, filters, sort, page) lives in the URL: shareable, survives a reload and the
// back button. Search params arrive as string | string[] | undefined and anyone can edit them,
// so an invalid value falls back to its default instead of failing the page
export const searchParam = z.string().trim().catch('');

export const pageParam = z.coerce.number().int().min(1).catch(1);

export const sortDirections = ['asc', 'desc'] as const;

export type SortDirection = (typeof sortDirections)[number];

export function sortParams<const Key extends string>(
    keys: readonly [Key, ...Key[]],
    sort: Key,
    dir: SortDirection,
) {
    return { sort: z.enum(keys).catch(sort), dir: z.enum(sortDirections).catch(dir) };
}

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

// Clicking the sorted column flips its direction, clicking another one sorts by it in its
// natural direction (newest first for a date, A to Z for a name)
export function nextSort<Key extends string>(
    current: { sort: Key; dir: SortDirection },
    key: Key,
    firstDirection: SortDirection,
): { sort: Key; dir: SortDirection } {
    if (current.sort !== key) return { sort: key, dir: firstDirection };
    return { sort: key, dir: current.dir === 'asc' ? 'desc' : 'asc' };
}

// Sorts a copy: the input is the TanStack Query cache, it must not be reordered in place
export function sortBy<T>(
    items: T[],
    value: (item: T) => string | number,
    dir: SortDirection,
): T[] {
    const sign = dir === 'asc' ? 1 : -1;
    return [...items].sort((a, b) => {
        const left = value(a);
        const right = value(b);
        const order =
            typeof left === 'string' && typeof right === 'string'
                ? left.localeCompare(right)
                : Number(left) - Number(right);
        return order * sign;
    });
}

export type ListPage<T> = { items: T[]; page: number; pageCount: number };

// A page past the end (an old link, rows deleted since) shows the last page instead of nothing
export function paginate<T>(items: T[], page: number, pageSize: number): ListPage<T> {
    const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
    const current = Math.min(page, pageCount);
    return {
        items: items.slice((current - 1) * pageSize, current * pageSize),
        page: current,
        pageCount,
    };
}

// Case-insensitive "contains" on any of the fields. An empty search matches everything
export function matchesSearch(fields: string[], search: string): boolean {
    const needle = search.toLowerCase();
    return !needle || fields.some((field) => field.toLowerCase().includes(needle));
}
