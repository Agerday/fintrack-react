import { NextResponse } from 'next/server';
import { clientStore } from '@/app/api/clients/store';
import { emailExists } from '@/features/clients/rules';
import { withErrorHandling } from '@/lib/with-error-handling';
import { HttpError } from '@/lib/http-error';

export const GET = withErrorHandling(async (request: Request) => {
    const email = new URL(request.url).searchParams.get('email');
    if (!email) throw new HttpError(400, 'Email is required', 'email');

    return NextResponse.json({ exists: emailExists(clientStore.clients, email) });
});
