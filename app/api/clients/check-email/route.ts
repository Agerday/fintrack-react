import { NextResponse } from 'next/server';
import { clientStore } from '@/app/api/clients/store';
import { withErrorHandling } from '@/lib/with-error-handling';

export const GET = withErrorHandling(async (request: Request) => {
    const email = new URL(request.url).searchParams.get('email')?.toLowerCase();
    const exists = clientStore.clients.some((c) => c.email.toLowerCase() === email);
    return NextResponse.json({ exists });
});
