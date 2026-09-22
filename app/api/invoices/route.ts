import { NextResponse } from 'next/server';
import { invoices } from '@/features/invoices/data';

export async function GET() {
    return NextResponse.json(invoices);
}
