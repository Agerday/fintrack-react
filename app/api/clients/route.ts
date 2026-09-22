import { NextResponse } from 'next/server';
import { clients } from '@/features/clients/data';

export async function GET() {
    return NextResponse.json(clients);
}
