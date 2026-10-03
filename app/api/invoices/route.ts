import { NextResponse } from 'next/server';
import { invoiceStore } from '@/app/api/invoices/store';
import { invoiceSchema } from '@/features/invoices/schema';
import { createInvoice } from '@/features/invoices/rules';
import { withErrorHandling } from '@/lib/with-error-handling';
import { parseBody } from '@/lib/parse-body';
import { publishEvent } from '@/lib/realtime';
import type { InvoiceEvent } from '@/features/invoices/types';

export async function GET() {
    return NextResponse.json(invoiceStore.invoices);
}

export const POST = withErrorHandling(async (request: Request) => {
    const data = await parseBody(request, invoiceSchema);

    const newInvoice = createInvoice(data, new Date());

    // create new array with new invoice and existing one
    // .push() mutates the existing array
    invoiceStore.invoices = [...invoiceStore.invoices, newInvoice];
    // WebSocket: publish AFTER the store is updated, so clients refetching get the new invoice
    await publishEvent<InvoiceEvent>(request, { type: 'invoice.created', id: newInvoice.id });

    // Return the created resource, as typed by createInvoice in api.ts
    return NextResponse.json(newInvoice, { status: 201 });
});
