import React from 'react';
import Link from 'next/link';
import { getTransactions } from '../../../../lib/models/Finance';

export default async function IncomePage() {
  let transactions = [];
  try {
    // Fetch all transactions (no filters)
    transactions = await getTransactions({});
  } catch (err) {
    console.error('Failed to fetch transactions:', err);
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Income / Expense Transactions</h1>
      {transactions.length === 0 ? (
        <p className="text-slate-400">No transaction data available.</p>
      ) : (
        <table className="min-w-full bg-slate-800 text-white">
          <thead>
            <tr className="border-b border-slate-600">
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Account</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-right">Amount</th>
              <th className="px-4 py-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx._id} className="border-b border-slate-700">
                <td className="px-4 py-2">{new Date(tx.date).toLocaleDateString()}</td>
                <td className="px-4 py-2">{tx.accountId?.toString?.()}</td>
                <td className="px-4 py-2 capitalize">{tx.type}</td>
                <td className="px-4 py-2 text-right">{Number(tx.amount).toFixed(2)}</td>
                <td className="px-4 py-2">{tx.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Link href="/admin/finance" className="text-indigo-300 hover:underline">
        ← Back to Finance Dashboard
      </Link>
    </div>
  );
}
