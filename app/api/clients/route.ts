import { NextResponse } from 'next/server';
import { clients } from '@/features/clients/data';
import { Client } from '@/features/clients/types';
import { clientStore } from '@/app/api/clients/store';

export async function GET() {
    return NextResponse.json(clients);
}

export async function POST(request: Request) {
    const body = await request.json();
    console.log(body);
    const newClient: Client = { id: `INV-${Date.now()}`, ...body };
    console.log(newClient);

    clientStore.clients = [...clientStore.clients, newClient];

    return NextResponse.json(clientStore.clients, { status: 201 });
}
