import { NextResponse } from 'next/server';
import { tradingStore } from '@/app/api/trading/store';

export async function GET() {
    return NextResponse.json(tradingStore.positions);
}
