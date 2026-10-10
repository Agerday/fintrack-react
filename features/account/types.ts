// Only invoice payments for now: trading will add buy and sell transactions
export type TransactionType = 'invoice_payment';

// One line of the bank account ledger. amount is signed: credits > 0, debits < 0
export type Transaction = {
    id: string;
    date: string;
    type: TransactionType;
    label: string;
    amount: number;
    invoiceId?: string;
};

// What GET /api/account returns: the balance is derived from the ledger, never stored
export type Account = {
    balance: number;
    transactions: Transaction[];
};
