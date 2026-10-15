import { NextResponse } from 'next/server';
import { accountStore } from '@/app/api/account/store';
import { clientStore } from '@/app/api/clients/store';
import { companyStore } from '@/app/api/company/store';
import { invoiceStore } from '@/app/api/invoices/store';
import { profileStore } from '@/app/api/profile/store';
import { tradingStore } from '@/app/api/trading/store';
import { transactions } from '@/features/account/data';
import { clients } from '@/features/clients/data';
import { company } from '@/features/company/data';
import { invoices } from '@/features/invoices/data';
import { profile } from '@/features/profile/data';
import { orders, pendingOrders, positions } from '@/features/trading/data';

// Puts every store back to its seed, like a fresh server start. Copies, so later
// edits to the stores can never reach the seed data
export async function POST() {
    invoiceStore.invoices = [...invoices];
    clientStore.clients = [...clients];
    accountStore.transactions = [...transactions];
    companyStore.company = { ...company };
    profileStore.profile = { ...profile };
    tradingStore.positions = [...positions];
    tradingStore.orders = [...orders];
    tradingStore.pendingOrders = [...pendingOrders];

    return NextResponse.json({ success: true });
}
