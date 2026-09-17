export type InvoiceStatus = 'paid' | 'pending' | 'overdue';

export type Invoice = {
    id: string;
    client: string;
    date: string;
    amount: number;
    status: InvoiceStatus;
};
