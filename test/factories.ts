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
