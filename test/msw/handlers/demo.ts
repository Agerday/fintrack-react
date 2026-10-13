import { http, HttpResponse } from 'msw';
import { accountDb } from './account';
import { clientDb } from './clients';
import { companyDb } from './company';
import { invoiceDb } from './invoices';
import { profileDb } from './profile';

// Mirrors app/api/demo/reset. The test dbs' "seed" is their reset state
export const demoHandlers = [
    http.post('/api/demo/reset', () => {
        invoiceDb.reset();
        clientDb.reset();
        accountDb.reset();
        companyDb.reset();
        profileDb.reset();
        return HttpResponse.json({ success: true });
    }),
];
