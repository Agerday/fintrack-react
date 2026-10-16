import { NextResponse } from 'next/server';
import { readAccount } from '@/features/account/queries';

export async function GET() {
    return NextResponse.json(readAccount());
}
