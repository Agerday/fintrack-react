import { NextResponse } from 'next/server';
import { clientStore } from '@/app/api/clients/store';

export async function GET(request: Request) {
    const email = new URL(request.url).searchParams.get('email')?.toLowerCase();
    const exists = clientStore.clients.some((c) => c.email.toLowerCase() === email);
    return NextResponse.json({ exists });
}
