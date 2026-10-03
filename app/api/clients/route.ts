import { NextResponse } from 'next/server';
import { clientStore } from '@/app/api/clients/store';
import { clientSchema } from '@/features/clients/schema';
import { createClient, emailExists } from '@/features/clients/rules';
import { withErrorHandling } from '@/lib/with-error-handling';
import { parseBody } from '@/lib/parse-body';
import { HttpError } from '@/lib/http-error';

export async function GET() {
    return NextResponse.json(clientStore.clients);
}

export const POST = withErrorHandling(async (request: Request) => {
    const data = await parseBody(request, clientSchema);

    if (emailExists(clientStore.clients, data.email)) {
        throw new HttpError(409, 'Email already exists', 'email');
    }

    clientStore.clients = [...clientStore.clients, createClient(data, new Date())];

    return NextResponse.json(clientStore.clients, { status: 201 });
});
