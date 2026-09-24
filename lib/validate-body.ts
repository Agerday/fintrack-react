import { NextResponse } from 'next/server';
import type { z } from 'zod';

type ValidationResult<T> =
    { data: T; errorResponse?: never } | { data?: never; errorResponse: NextResponse };

function badRequest(message: string, field?: PropertyKey) {
    return NextResponse.json({ message, field }, { status: 400 });
}

export async function validateBody<T extends z.ZodType>(
    request: Request,
    schema: T,
): Promise<ValidationResult<z.infer<T>>> {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return { errorResponse: badRequest('Invalid JSON body') };
    }

    const result = schema.safeParse(body);
    if (!result.success) {
        const issue = result.error.issues[0];
        return { errorResponse: badRequest(issue.message, issue.path[0]) };
    }

    return { data: result.data };
}
