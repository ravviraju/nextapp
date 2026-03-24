"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function RiskAssessmentListPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/risk-assessment");
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to load questions");
      }
      setItems(data.questions || []);
    } catch (error) {
      alert(error.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Risk Assessment Questions</h1>
        <Link
          href="/admin/riskassessment/add-question"
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          Add Question
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <div className="mb-3">
          <button
            onClick={fetchItems}
            disabled={loading}
            className="px-3 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-60"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {items.length === 0 ? (
          <p className="text-gray-500">No risk questions found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-3 py-2 border-b">Question</th>
                  <th className="text-left px-3 py-2 border-b">Status</th>
                  <th className="text-left px-3 py-2 border-b">Options</th>
                  <th className="text-left px-3 py-2 border-b">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row._id}>
                    <td className="px-3 py-2 border-b max-w-md">
                      <div className="font-medium">{row.question}</div>
                      {row.link ? (
                        <a
                          href={row.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline text-xs"
                        >
                          {row.link}
                        </a>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 border-b capitalize">{row.status}</td>
                    <td className="px-3 py-2 border-b">
                      {Array.isArray(row.options) ? row.options.length : 0}
                    </td>
                    <td className="px-3 py-2 border-b">
                      <Link
                        href={`/admin/riskassessment/${row._id}/edit`}
                        className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
