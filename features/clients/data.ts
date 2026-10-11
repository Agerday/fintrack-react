import type { ClientRecord } from './types';

// Contact details only: the invoice count and total come from features/invoices/data.ts.
// Pied Piper and Massive Dynamic are missing on purpose: they only exist on invoices
export const clients: ClientRecord[] = [
    {
        id: '1',
        name: 'Acme Corporation',
        email: 'billing@acme.com',
        phone: '+1 2025550143',
        company: 'Acme Corporation',
    },
    {
        id: '2',
        name: 'Globex Inc.',
        email: 'finance@globex.com',
        phone: '+1 3125550178',
        company: 'Globex Inc.',
    },
    {
        id: '3',
        name: 'Soylent Corp.',
        email: 'accounts@soylent.com',
        phone: '+1 4155550112',
        company: 'Soylent Corp.',
    },
    {
        id: '4',
        name: 'Initech',
        email: 'billing@initech.com',
        phone: '+1 5125550199',
        company: 'Initech',
    },
    {
        id: '5',
        name: 'Hooli',
        email: 'ap@hooli.com',
        phone: '+1 6505550137',
        company: 'Hooli',
    },
    {
        id: '6',
        name: 'Stark Industries',
        email: 'payables@stark.com',
        phone: '+1 2125550166',
        company: 'Stark Industries',
    },
    {
        id: '7',
        name: 'Wayne Enterprises',
        email: 'finance@wayne.com',
        phone: '+1 2015550184',
        company: 'Wayne Enterprises',
    },
    {
        id: '8',
        name: 'Umbrella Corp.',
        email: 'billing@umbrella.com',
        phone: '+44 2075550122',
        company: 'Umbrella Corp.',
    },
    {
        // No invoice yet: listed with nothing invoiced
        id: '9',
        name: 'Cyberdyne Systems',
        email: 'accounts@cyberdyne.com',
        phone: '+1 3105550101',
        company: 'Cyberdyne Systems',
    },
];
