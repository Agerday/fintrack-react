import { NextResponse } from 'next/server';
import { invoices as seedInvoices } from '@/features/invoices/data';
import { Invoice } from '@/features/invoices/types';

// In-memory store — persists across requests, resets on server restart
let invoices: Invoice[] = [...seedInvoices];

export async function GET() {
    return NextResponse.json(invoices);
}

export async function POST(request: Request) {
    const body = await request.json();

    if (!body.client) {
        return NextResponse.json({ message: 'Client is required' }, { status: 400 });
    }

    const newInvoice: Invoice = { id: `INV-${Date.now()}`, ...body };

    // create new array with new invoice and existing one
    // .push() mutates the existing array
    invoices = [...invoices, newInvoice];

    return NextResponse.json(invoices, { status: 201 });
}
