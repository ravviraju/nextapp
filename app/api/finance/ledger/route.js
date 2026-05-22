import { NextResponse } from 'next/server';
import { getGeneralLedger } from '@/lib/models/Finance';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const ledger = await getGeneralLedger({ startDate, endDate });
    return NextResponse.json({ success: true, ledger });
  } catch (error) {
    console.error('[finance/ledger] GET error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
