import React from 'react';
import Link from 'next/link';

export default async function LedgerPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/finance/ledger`, {
    cache: 'no-store',
  });
  const data = await res.json();
  const ledger = data.ledger || [];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">General Ledger</h1>
      <table className="min-w-full bg-slate-800 text-white">
        <thead>
          <tr className="border-b border-slate-600">
            <th className="px-4 py-2 text-left">Account</th>
            <th className="px-4 py-2 text-left">Type</th>
            <th className="px-4 py-2 text-right">Debit</th>
            <th className="px-4 py-2 text-right">Credit</th>
            <th className="px-4 py-2 text-right">Balance</th>
          </tr>
        </thead>
        <tbody>
          {ledger.map((row) => (
            <tr key={row.accountId} className="border-b border-slate-700">
              <td className="px-4 py-2">{row.name}</td>
              <td className="px-4 py-2">{row.type}</td>
              <td className="px-4 py-2 text-right">{row.debit.toFixed(2)}</td>
              <td className="px-4 py-2 text-right">{row.credit.toFixed(2)}</td>
              <td className="px-4 py-2 text-right">{row.balance.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link href="/admin/finance" className="text-indigo-300 hover:underline">
        ← Back to Finance Dashboard
      </Link>
    </div>
  );
}
