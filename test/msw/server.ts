import { setupServer } from 'msw/node';
import { accountHandlers } from './handlers/account';
import { companyHandlers } from './handlers/company';
import { invoiceHandlers } from './handlers/invoices';
import { profileHandlers } from './handlers/profile';

export const server = setupServer(
    ...invoiceHandlers,
    ...accountHandlers,
    ...profileHandlers,
    ...companyHandlers,
);
