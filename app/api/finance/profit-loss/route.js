import { NextResponse } from 'next/server';
import { getProfitLoss } from '@/lib/models/Finance';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const result = await getProfitLoss({ startDate, endDate });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('[finance/profit-loss] GET error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
