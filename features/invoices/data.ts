import type { Invoice } from './types';

export const invoices: Invoice[] = [
    {
        id: 'INV-001',
        client: 'Acme Corporation',
        date: 'Sep 12, 2026',
        amount: 2400,
        status: 'paid',
    },
    {
        id: 'INV-002',
        client: 'Globex Inc.',
        date: 'Sep 10, 2026',
        amount: 1850,
        status: 'pending',
    },
    {
        id: 'INV-003',
        client: 'Soylent Corp.',
        date: 'Sep 08, 2026',
        amount: 3200,
        status: 'paid',
    },
    {
        id: 'INV-004',
        client: 'Initech',
        date: 'Sep 02, 2026',
        amount: 980,
        status: 'overdue',
    },
];
