import type { Transaction } from '@/features/account/types';
import type { ClientRecord } from '@/features/clients/types';
import type { Invoice } from '@/features/invoices/types';

let invoiceSequence = 0;

// Valid by default: a test only overrides the fields its behavior depends on
export function buildInvoice(overrides: Partial<Invoice> = {}): Invoice {
    invoiceSequence += 1;
    return {
        id: `INV-${String(invoiceSequence).padStart(3, '0')}`,
        client: `Client ${invoiceSequence}`,
        date: '2026-09-01T00:00:00.000Z',
        amount: 100,
        status: 'pending',
        ...overrides,
    };
}

let clientSequence = 0;

export function buildClient(overrides: Partial<ClientRecord> = {}): ClientRecord {
    clientSequence += 1;
    return {
        id: `CLI-${String(clientSequence).padStart(3, '0')}`,
        name: `Client ${clientSequence}`,
        email: `client${clientSequence}@example.com`,
        phone: '+32 470000000',
        company: `Company ${clientSequence}`,
        ...overrides,
    };
}

let transactionSequence = 0;

export function buildTransaction(overrides: Partial<Transaction> = {}): Transaction {
    transactionSequence += 1;
    return {
        id: `TRX-${String(transactionSequence).padStart(3, '0')}`,
        date: '2026-09-01T00:00:00.000Z',
        type: 'invoice_payment',
        label: `Payment ${transactionSequence}`,
        amount: 100,
        ...overrides,
    };
}
