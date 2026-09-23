import { NextResponse } from 'next/server';
import { invoiceStore } from '@/app/api/invoices/store';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await request.json();
    invoiceStore.invoices = invoiceStore.invoices.map((invoice) =>
        invoice.id === id ? { ...invoice, ...body } : invoice,
    );
    return NextResponse.json({ id, ...body });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    invoiceStore.invoices = invoiceStore.invoices.filter((invoice) => invoice.id !== id);
    return NextResponse.json({ success: true });
}
