import { NextResponse } from 'next/server';
import { Client } from '@/features/clients/types';
import { clientStore } from '@/app/api/clients/store';
import { countries } from '@/features/clients/countries';
import { clientSchema } from '@/features/clients/schema';
import { withErrorHandling } from '@/lib/with-error-handling';
import { parseBody } from '@/lib/parse-body';
import { HttpError } from '@/lib/http-error';

export async function GET() {
    return NextResponse.json(clientStore.clients);
}

export const POST = withErrorHandling(async (request: Request) => {
    const data = await parseBody(request, clientSchema);

    const emailExists = clientStore.clients.some(
        (client) => client.email.toLowerCase() === data.email.toLowerCase(),
    );
    if (emailExists) throw new HttpError(409, 'Email already exists', 'email');

    const country = countries.find((c) => c.code === data.countryCode);
    const phone = `${country?.dialCode ?? ''} ${data.phone}`;

    const newClient: Client = {
        id: `INV-${Date.now()}`,
        name: data.name,
        email: data.email,
        phone,
        company: data.company,
        invoices: 0,
        total: 0,
    };

    clientStore.clients = [...clientStore.clients, newClient];

    return NextResponse.json(clientStore.clients, { status: 201 });
});
