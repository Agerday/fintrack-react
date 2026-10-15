import { accountStore } from '@/app/api/account/store';
import { tradingStore } from '@/app/api/trading/store';
import { tradeTransaction } from '@/features/account/rules';
import type { Order, Position } from '@/features/trading/types';

// Saves filled orders everywhere they show: positions (as they are after the fills), order
// history and bank account. Shared by manual market orders and the stop losses / take profits
// filled on a tick
export function commitOrders(orders: Order[], positions: Position[]) {
    tradingStore.positions = positions;
    tradingStore.orders = [...tradingStore.orders, ...orders];
    accountStore.transactions = [...accountStore.transactions, ...orders.map(tradeTransaction)];
}
