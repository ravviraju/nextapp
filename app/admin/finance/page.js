import React from 'react';
import Link from 'next/link';

export default async function FinanceHome() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Finance Dashboard</h1>
      <ul className="list-disc list-inside text-white space-y-2">
        <li>
          <Link href="/admin/finance/ledger" className="text-indigo-300 hover:underline">
            General Ledger
          </Link>
        </li>
        <li>
          <Link href="/admin/finance/income" className="text-indigo-300 hover:underline">
            Income / Expense
          </Link>
        </li>
        <li>
          <Link href="/admin/finance/profit-loss" className="text-indigo-300 hover:underline">
            Profit &amp; Loss
          </Link>
        </li>
      </ul>
    </div>
  );
}
