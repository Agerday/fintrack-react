import { setupServer } from 'msw/node';
import { companyHandlers } from './handlers/company';
import { invoiceHandlers } from './handlers/invoices';
import { profileHandlers } from './handlers/profile';

export const server = setupServer(...invoiceHandlers, ...profileHandlers, ...companyHandlers);
