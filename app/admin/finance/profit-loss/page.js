import React from 'react';
import Link from 'next/link';
import { getProfitLoss } from '../../../../lib/models/Finance';

export default async function ProfitLossPage() {
  let result = { income: 0, expense: 0, profit: 0 };
  try {
    result = await getProfitLoss({});
  } catch (err) {
    console.error('Failed to fetch profit/loss:', err);
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Profit &amp; Loss Report</h1>
      <div className="grid grid-cols-3 gap-4 text-white mt-4">
        <div className="bg-slate-800 p-4 rounded-lg text-center">
          <div className="text-sm uppercase text-slate-400">Income</div>
          <div className="text-xl font-mono">${result.income.toFixed(2)}</div>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg text-center">
          <div className="text-sm uppercase text-slate-400">Expense</div>
          <div className="text-xl font-mono">${result.expense.toFixed(2)}</div>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg text-center">
          <div className="text-sm uppercase text-slate-400">Profit</div>
          <div className="text-xl font-mono">${result.profit.toFixed(2)}</div>
        </div>
      </div>
      <Link href="/admin/finance" className="text-indigo-300 hover:underline mt-6 inline-block">
        ← Back to Finance Dashboard
      </Link>
    </div>
  );
}
