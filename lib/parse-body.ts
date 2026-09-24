import type { z } from 'zod';
import { HttpError } from '@/lib/http-error';

// Parses and validates the request body with a Zod schema, throws a 400 HttpError if invalid
export async function parseBody<T extends z.ZodType>(
    request: Request,
    schema: T,
): Promise<z.infer<T>> {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        throw new HttpError(400, 'Invalid JSON body');
    }

    const result = schema.safeParse(body);
    if (!result.success) {
        const issue = result.error.issues[0];
        const field = issue.path[0];
        throw new HttpError(400, issue.message, field === undefined ? undefined : String(field));
    }

    return result.data;
}
