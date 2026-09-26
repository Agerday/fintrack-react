import { NextResponse } from 'next/server';
import { Invoice } from '@/features/invoices/types';
import { invoiceStore } from '@/app/api/invoices/store';
import { invoiceSchema } from '@/features/invoices/schema';
import { withErrorHandling } from '@/lib/with-error-handling';
import { parseBody } from '@/lib/parse-body';
import { publishEvent } from '@/lib/realtime';
import type { InvoiceEvent } from '@/features/invoices/types';

export async function GET() {
    return NextResponse.json(invoiceStore.invoices);
}

export const POST = withErrorHandling(async (request: Request) => {
    const data = await parseBody(request, invoiceSchema);

    const newInvoice: Invoice = {
        id: `INV-${Date.now()}`,
        ...data,
        date: new Date().toISOString(),
        status: 'pending',
    };

    // create new array with new invoice and existing one
    // .push() mutates the existing array
    invoiceStore.invoices = [...invoiceStore.invoices, newInvoice];
    // WebSocket: publish AFTER the store is updated, so clients refetching get the new invoice
    await publishEvent<InvoiceEvent>({ type: 'invoice.created', id: newInvoice.id });

    return NextResponse.json(invoiceStore.invoices, { status: 201 });
});
