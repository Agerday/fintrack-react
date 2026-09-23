import type { Client } from './types';

export const clients: Client[] = [
    {
        id: '1',
        name: 'Acme Corporation',
        email: 'billing@acme.com',
        phone: '3245454545',
        company: 'random',
        invoices: 12,
        total: 18400,
    },
    {
        id: '2',
        name: 'Globex Inc.',
        email: 'finance@globex.com',
        phone: '3245454545',
        company: 'random',
        invoices: 8,
        total: 11250,
    },
    {
        id: '3',
        name: 'Soylent Corp.',
        email: 'accounts@soylent.com',
        phone: '3245454545',
        company: 'random',
        invoices: 6,
        total: 9800,
    },
    {
        id: '4',
        name: 'Initech',
        email: 'billing@initech.com',
        phone: '3245454545',
        company: 'random',
        invoices: 4,
        total: 4200,
    },
];
