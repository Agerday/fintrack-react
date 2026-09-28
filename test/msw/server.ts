import { setupServer } from 'msw/node';
import { invoiceHandlers } from './handlers/invoices';

export const server = setupServer(...invoiceHandlers);
