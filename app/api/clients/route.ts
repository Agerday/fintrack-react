import { NextResponse } from 'next/server';
import { Client } from '@/features/clients/types';
import { clientStore } from '@/app/api/clients/store';
import { countries } from '@/features/clients/countries';
import { validateBody } from '@/lib/validate-body';
import { clientSchema } from '@/features/clients/schema';

export async function GET() {
    return NextResponse.json(clientStore.clients);
}

export async function POST(request: Request) {
    const { data: body, errorResponse } = await validateBody(request, clientSchema);
    if (errorResponse) return errorResponse;

    const emailExists = clientStore.clients.some(
        (client) => client.email.toLowerCase() === body.email.toLowerCase(),
    );

    if (emailExists) {
        return NextResponse.json(
            { message: 'Email already exists', field: 'email' },
            { status: 409 },
        );
    }

    const country = countries.find((c) => c.code === body.countryCode);
    const phone = `${country?.dialCode ?? ''} ${body.phone}`;

    const newClient: Client = {
        id: `INV-${Date.now()}`,
        name: body.name,
        email: body.email,
        phone,
        company: body.company,
        invoices: 0,
        total: 0,
    };

    clientStore.clients = [...clientStore.clients, newClient];

    return NextResponse.json(clientStore.clients, { status: 201 });
}
