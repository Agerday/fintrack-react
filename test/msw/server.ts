import { setupServer } from 'msw/node';
import { accountHandlers } from './handlers/account';
import { clientHandlers } from './handlers/clients';
import { companyHandlers } from './handlers/company';
import { invoiceHandlers } from './handlers/invoices';
import { profileHandlers } from './handlers/profile';
import { tradingHandlers } from './handlers/trading';
import { demoHandlers } from './handlers/demo';

export const server = setupServer(
    ...invoiceHandlers,
    ...clientHandlers,
    ...accountHandlers,
    ...profileHandlers,
    ...companyHandlers,
    ...tradingHandlers,
    ...demoHandlers,
);
