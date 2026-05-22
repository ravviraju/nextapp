import React from 'react';
import Link from 'next/link';
import { getGeneralLedger } from '../../../../lib/models/Finance';

export default async function LedgerPage() {
  let ledger = []
  try {
    ledger = await getGeneralLedger({})
  } catch (err) {
    console.error('Failed to fetch ledger:', err)
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">General Ledger</h1>
      {ledger.length === 0 ? (
        <p className="text-slate-400">No ledger data available.</p>
      ) : (
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
              <tr key={row.accountId?.toString()} className="border-b border-slate-700">
                <td className="px-4 py-2">{row.name}</td>
                <td className="px-4 py-2">{row.type}</td>
                <td className="px-4 py-2 text-right">{row.debit.toFixed(2)}</td>
                <td className="px-4 py-2 text-right">{row.credit.toFixed(2)}</td>
                <td className="px-4 py-2 text-right">{row.balance.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Link href="/admin/finance" className="text-indigo-300 hover:underline">
        ← Back to Finance Dashboard
      </Link>
    </div>
  )
}
