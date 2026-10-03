import { setupServer } from 'msw/node';
import { invoiceHandlers } from './handlers/invoices';
import { profileHandlers } from './handlers/profile';

export const server = setupServer(...invoiceHandlers, ...profileHandlers);
