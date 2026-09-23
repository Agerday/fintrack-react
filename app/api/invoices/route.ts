import { NextResponse } from 'next/server';
import { Invoice } from '@/features/invoices/types';
import { invoiceStore } from '@/app/api/invoices/store';

export async function GET() {
    return NextResponse.json(invoiceStore.invoices);
}

export async function POST(request: Request) {
    const body = await request.json();

    if (!body.client) {
        return NextResponse.json({ message: 'Client is required' }, { status: 400 });
    }

    const newInvoice: Invoice = { id: `INV-${Date.now()}`, ...body };

    // create new array with new invoice and existing one
    // .push() mutates the existing array
    invoiceStore.invoices = [...invoiceStore.invoices, newInvoice];

    return NextResponse.json(invoiceStore.invoices, { status: 201 });
}
