import { NextResponse } from 'next/server';
import { HttpError } from './http-error';

// Wraps a route handler: maps HttpError to a JSON response and any unexpected error to a 500 (like @ControllerAdvice)
export function withErrorHandling<A extends unknown[]>(handler: (...args: A) => Promise<Response>) {
    return async (...args: A) => {
        try {
            return await handler(...args);
        } catch (error) {
            if (error instanceof HttpError) {
                return NextResponse.json(
                    { message: error.message, field: error.field },
                    { status: error.status },
                );
            }
            console.error(error);
            return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
        }
    };
}
