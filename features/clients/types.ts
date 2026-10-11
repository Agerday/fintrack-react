// Contact details, as stored. The invoice figures are never stored: they would drift from
// the invoices, so they are derived on every read (see withInvoiceStats in rules.ts)
export type ClientRecord = {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
};

export type Client = ClientRecord & {
    invoices: number;
    total: number;
};
