import { NextResponse } from 'next/server';
import { clientStore } from '@/app/api/clients/store';
import { invoiceStore } from '@/app/api/invoices/store';
import { clientSchema } from '@/features/clients/schema';
import { createClient, emailExists, withInvoiceStats } from '@/features/clients/rules';
import { listClients } from '@/features/clients/queries';
import { withErrorHandling } from '@/lib/with-error-handling';
import { parseBody } from '@/lib/parse-body';
import { HttpError } from '@/lib/http-error';

export async function GET() {
    return NextResponse.json(listClients());
}

export const POST = withErrorHandling(async (request: Request) => {
    const data = await parseBody(request, clientSchema);

    if (emailExists(clientStore.clients, data.email)) {
        throw new HttpError(409, 'Email already exists', 'email');
    }

    const created = createClient(data, new Date());
    clientStore.clients = [...clientStore.clients, created];

    const [client] = withInvoiceStats([created], invoiceStore.invoices);
    return NextResponse.json(client, { status: 201 });
});
