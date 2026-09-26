import { NextResponse } from 'next/server';
import { invoiceStore } from '@/app/api/invoices/store';
import { invoiceUpdateSchema } from '@/features/invoices/schema';
import { withErrorHandling } from '@/lib/with-error-handling';
import { findOrThrow } from '@/lib/find-or-throw';
import { parseBody } from '@/lib/parse-body';

export const GET = withErrorHandling(
    async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
        const { id } = await params;
        const invoice = findOrThrow(invoiceStore.invoices, id, 'Invoice');
        return NextResponse.json(invoice);
    },
);

export const PATCH = withErrorHandling(
    async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
        const { id } = await params;
        const data = await parseBody(request, invoiceUpdateSchema);
        findOrThrow(invoiceStore.invoices, id, 'Invoice');

        invoiceStore.invoices = invoiceStore.invoices.map((invoice) =>
            invoice.id === id ? { ...invoice, ...data } : invoice,
        );
        return NextResponse.json({ id, ...data });
    },
);

export const DELETE = withErrorHandling(
    async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
        const { id } = await params;
        findOrThrow(invoiceStore.invoices, id, 'Invoice');

        invoiceStore.invoices = invoiceStore.invoices.filter((invoice) => invoice.id !== id);
        return NextResponse.json({ success: true });
    },
);
