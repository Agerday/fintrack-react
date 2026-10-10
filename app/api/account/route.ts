import { NextResponse } from 'next/server';
import { accountStore } from '@/app/api/account/store';
import { toAccount } from '@/features/account/rules';

export async function GET() {
    return NextResponse.json(toAccount(accountStore.transactions));
}
