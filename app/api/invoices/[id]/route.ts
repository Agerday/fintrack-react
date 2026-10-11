import { NextResponse } from 'next/server';
import { accountStore } from '@/app/api/account/store';
import { invoiceStore } from '@/app/api/invoices/store';
import { paymentTransaction } from '@/features/account/rules';
import { invoiceUpdateSchema } from '@/features/invoices/schema';
import {
    canChangeStatus,
    canDeleteInvoice,
    canEditInvoice,
    isNewPayment,
} from '@/features/invoices/rules';
import { HttpError } from '@/lib/http-error';
import { withErrorHandling } from '@/lib/with-error-handling';
import { findOrThrow } from '@/lib/find-or-throw';
import { parseBody } from '@/lib/parse-body';
import { publishEvent } from '@/lib/realtime';
import type { InvoiceEvent } from '@/features/invoices/types';

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
        const invoice = findOrThrow(invoiceStore.invoices, id, 'Invoice');
        if (data.status && !canChangeStatus(invoice.status, data.status)) {
            throw new HttpError(409, 'A paid invoice cannot change status');
        }
        if (!canEditInvoice(invoice.status, data)) {
            throw new HttpError(409, 'A paid invoice cannot be edited');
        }
        const updated = { ...invoice, ...data };

        invoiceStore.invoices = invoiceStore.invoices.map((invoice) =>
            invoice.id === id ? updated : invoice,
        );
        if (isNewPayment(invoice.status, data.status)) {
            accountStore.transactions = [
                ...accountStore.transactions,
                paymentTransaction(updated, new Date()),
            ];
        }
        // WebSocket: notify every connected client (other tabs included) that this invoice changed
        await publishEvent<InvoiceEvent>(request, { type: 'invoice.updated', id });
        // The full invoice, as typed by updateInvoice in api.ts (not only the patched fields)
        return NextResponse.json(updated);
    },
);

export const DELETE = withErrorHandling(
    async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
        const { id } = await params;
        const invoice = findOrThrow(invoiceStore.invoices, id, 'Invoice');
        if (!canDeleteInvoice(invoice.status)) {
            throw new HttpError(409, 'A paid invoice cannot be deleted');
        }

        invoiceStore.invoices = invoiceStore.invoices.filter((invoice) => invoice.id !== id);
        // WebSocket: clients showing this invoice will refetch and get a 404
        await publishEvent<InvoiceEvent>(request, { type: 'invoice.deleted', id });
        return NextResponse.json({ success: true });
    },
);
