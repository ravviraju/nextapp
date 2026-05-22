import { NextResponse } from 'next/server';
import { getTransactions } from '@/lib/models/Finance';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const accountId = searchParams.get('accountId');
    const transactions = await getTransactions({ startDate, endDate, accountId });
    return NextResponse.json({ success: true, transactions });
  } catch (error) {
    console.error('[finance/income] GET error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
