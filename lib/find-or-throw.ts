import { HttpError } from './http-error';

// Returns the item matching the id, throws a 404 HttpError if not found (like findById().orElseThrow())
export function findOrThrow<T extends { id: string }>(items: T[], id: string, resource: string): T {
    const item = items.find((i) => i.id === id);
    if (!item) throw new HttpError(404, `${resource} not found`);
    return item;
}
