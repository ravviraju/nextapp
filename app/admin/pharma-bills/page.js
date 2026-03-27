"use client";

import { useEffect, useMemo, useState } from "react";

export default function PharmaBillsPage() {
  const [inventory, setInventory] = useState([]);
  const [bills, setBills] = useState([]);
  const [expandedBillId, setExpandedBillId] = useState(null);

  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("");
  const [patientAddress, setPatientAddress] = useState("");

  const [items, setItems] = useState([
    { inventoryId: "", quantity: "", unitPrice: "" },
  ]);

  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const HOSPITAL = {
    name: "Raju Hospital",
    address: "Hospital Street, Your City",
    phone: "+91 00000 00000",
    email: "info@rajuhospital.com",
  };

  const fetchInventory = async () => {
    const res = await fetch("/api/pharma-inventory");
    const data = await res.json();
    if (data.success) setInventory(data.items || []);
  };

  const fetchBills = async () => {
    const res = await fetch("/api/pharma-bills");
    const data = await res.json();
    if (data.success) setBills(data.bills || []);
  };

  useEffect(() => {
    fetchInventory();
    fetchBills();
  }, []);

  const total = useMemo(() => {
    return items.reduce((sum, it) => {
      const q = Number(it.quantity || 0);
      const p = Number(it.unitPrice || 0);
      if (!q || !p) return sum;
      return sum + q * p;
    }, 0);
  }, [items]);

  const setItemField = (idx, field, value) => {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it))
    );
  };

  const handleAddRow = () => {
    setItems((prev) => [
      ...prev,
      { inventoryId: "", quantity: "", unitPrice: "" },
    ]);
  };

  const handleRemoveRow = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleInventoryChange = (idx, inventoryId) => {
    const selected = inventory.find((x) => x._id === inventoryId);
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== idx) return it;
        return {
          ...it,
          inventoryId,
          unitPrice: selected ? String(selected.unitPrice ?? 0) : "",
        };
      })
    );
  };

  const handleCreateBill = async () => {
    setError("");
    if (!patientName || !patientPhone) {
      setError("Patient name and phone are required");
      return;
    }

    const cleanedItems = items
      .filter((x) => x.inventoryId)
      .map((x) => ({
        inventoryId: x.inventoryId,
        quantity: Number(x.quantity || 0),
        unitPrice: Number(x.unitPrice || 0),
      }));

    if (cleanedItems.length === 0) {
      setError("Add at least one item");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/pharma-bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName,
          patientPhone,
          patientAge: patientAge ? Number(patientAge) : null,
          patientGender,
          patientAddress,
          items: cleanedItems,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Failed to create bill");
        return;
      }

      alert("Bill created successfully");
      setPatientName("");
      setPatientPhone("");
      setPatientAge("");
      setPatientGender("");
      setPatientAddress("");
      setItems([{ inventoryId: "", quantity: "", unitPrice: "" }]);

      fetchBills();
      fetchInventory();
    } catch (e) {
      console.error("handleCreateBill error", e);
      setError("Failed to create bill");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full">
      <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
          Pharma Billing
        </h2>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Patient name"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
          />
          <input
            className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Patient phone"
            value={patientPhone}
            onChange={(e) => setPatientPhone(e.target.value)}
          />
          <input
            className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Patient age (optional)"
            value={patientAge}
            onChange={(e) => setPatientAge(e.target.value)}
          />
          <input
            className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Gender (optional)"
            value={patientGender}
            onChange={(e) => setPatientGender(e.target.value)}
          />
          <input
            className="sm:col-span-2 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Address (optional)"
            value={patientAddress}
            onChange={(e) => setPatientAddress(e.target.value)}
          />
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800">Billing Items</h3>
            <button
              type="button"
              onClick={handleAddRow}
              className="text-sm bg-slate-100 border px-3 py-2 rounded-lg hover:bg-slate-200"
            >
              + Add Item
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {items.map((it, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3"
              >
                <div className="sm:col-span-2">
                  <select
                    className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={it.inventoryId}
                    onChange={(e) =>
                      handleInventoryChange(idx, e.target.value)
                    }
                  >
                    <option value="">Select item</option>
                    {inventory.map((inv) => (
                      <option key={inv._id} value={inv._id}>
                        {inv.name} ({inv.quantity} {inv.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Qty"
                  value={it.quantity}
                  onChange={(e) =>
                    setItemField(idx, "quantity", e.target.value)
                  }
                />
                <input
                  className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Unit Price"
                  value={it.unitPrice}
                  onChange={(e) =>
                    setItemField(idx, "unitPrice", e.target.value)
                  }
                />

                <div className="sm:col-span-4 flex justify-end">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(idx)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-slate-600">
            Total:{" "}
            <span className="font-bold text-slate-900">₹{total}</span>
          </div>
          <button
            type="button"
            onClick={handleCreateBill}
            disabled={saving}
            className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Creating..." : "Create Bill"}
          </button>
        </div>
      </div>

      <div className="mt-6 bg-white shadow-sm border border-slate-200 rounded-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-slate-800">Bills List</h3>
          <button
            onClick={() => {
              setLoadingList(true);
              fetchBills().finally(() => setLoadingList(false));
            }}
            className="text-sm bg-slate-100 px-3 py-2 rounded-lg border hover:bg-slate-200 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loadingList}
          >
            {loadingList ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {bills.length === 0 ? (
          <p className="text-slate-500">No bills yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left border-b">Patient</th>
                  <th className="px-3 py-2 text-left border-b">Phone</th>
                  <th className="px-3 py-2 text-left border-b">Total</th>
                  <th className="px-3 py-2 text-left border-b">Items</th>
                  <th className="px-3 py-2 text-left border-b">Date</th>
                  <th className="px-3 py-2 text-left border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((b) => (
                  <>
                    <tr key={b._id} className="hover:bg-slate-50">
                      <td className="px-3 py-2 border-b">{b.patientName}</td>
                      <td className="px-3 py-2 border-b">{b.patientPhone}</td>
                      <td className="px-3 py-2 border-b">₹{b.total}</td>
                      <td className="px-3 py-2 border-b">{(b.items || []).length}</td>
                      <td className="px-3 py-2 border-b">
                        {b.createdAt ? new Date(b.createdAt).toLocaleString() : "-"}
                      </td>
                      <td className="px-3 py-2 border-b">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedBillId((prev) => (prev === b._id ? null : b._id))
                            }
                            className="text-blue-600 hover:underline text-sm"
                          >
                            {expandedBillId === b._id ? "Hide" : "View"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const items = b.items || [];
                              const win = window.open("", "_blank");
                              if (!win) return;

                              const escapeHtml = (s) =>
                                String(s ?? "")
                                  .replace(/&/g, "&amp;")
                                  .replace(/</g, "&lt;")
                                  .replace(/>/g, "&gt;");

                              const itemsHtml = items
                                .map(
                                  (it) => `
                                  <tr>
                                    <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${escapeHtml(
                                      it.name
                                    )}</td>
                                    <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${escapeHtml(
                                      it.batchNumber
                                    )}</td>
                                    <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;">${escapeHtml(
                                      it.quantity
                                    )} ${escapeHtml(it.unit || "")}</td>
                                    <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;">₹${escapeHtml(
                                      it.unitPrice
                                    )}</td>
                                    <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;">₹${escapeHtml(
                                      it.lineTotal
                                    )}</td>
                                  </tr>
                                `
                                )
                                .join("");

                              win.document.write(`
                                <html>
                                  <head>
                                    <title>Pharma Bill</title>
                                    <meta charset="utf-8" />
                                  </head>
                                  <body style="font-family: Arial, sans-serif; padding: 20px; color: #111827;">
                                    <div style="display:flex; justify-content:space-between; gap:16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 16px;">
                                      <div>
                                        <h2 style="margin:0;">${escapeHtml(HOSPITAL.name)}</h2>
                                        <div style="font-size: 12px; margin-top: 4px;">${escapeHtml(HOSPITAL.address)}</div>
                                        <div style="font-size: 12px; margin-top: 4px;">Phone: ${escapeHtml(HOSPITAL.phone)} | ${escapeHtml(
                                          HOSPITAL.email
                                        )}</div>
                                      </div>
                                      <div style="text-align:right;">
                                        <div style="font-size: 12px;">Bill ID: ${escapeHtml(b._id)}</div>
                                        <div style="font-size: 12px; margin-top: 4px;">Date: ${
                                          b.createdAt
                                            ? escapeHtml(new Date(b.createdAt).toLocaleString())
                                            : "-"
                                        }</div>
                                      </div>
                                    </div>

                                    <div style="margin-bottom: 16px;">
                                      <h3 style="margin:0 0 8px 0;">Patient Details</h3>
                                      <div style="font-size: 13px; line-height: 1.6;">
                                        <div><b>Name:</b> ${escapeHtml(b.patientName)}</div>
                                        <div><b>Phone:</b> ${escapeHtml(b.patientPhone)}</div>
                                      </div>
                                    </div>

                                    <div style="margin-bottom: 16px;">
                                      <h3 style="margin:0 0 8px 0;">Billing Details</h3>
                                      <table style="width:100%; border-collapse:collapse; font-size:13px;">
                                        <thead>
                                          <tr>
                                            <th style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:left;">Medicine</th>
                                            <th style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:left;">Batch</th>
                                            <th style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;">Qty</th>
                                            <th style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;">Unit Price</th>
                                            <th style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;">Line Total</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          ${itemsHtml}
                                        </tbody>
                                      </table>
                                      <div style="margin-top: 12px; display:flex; justify-content:flex-end;">
                                        <div style="border:1px solid #e5e7eb; padding:10px 14px; border-radius:10px;">
                                          <div style="font-size:12px; color:#4b5563;">Grand Total</div>
                                          <div style="font-size:18px; font-weight:bold;">₹${escapeHtml(b.total)}</div>
                                        </div>
                                      </div>
                                    </div>

                                    <div style="margin-top: 18px; font-size: 12px; color:#6b7280; text-align:center;">
                                      Thank you for your purchase.
                                    </div>
                                  </body>
                                </html>
                              `);

                              win.document.close();
                              win.focus();
                              win.print();
                            }}
                            className="text-green-700 hover:underline text-sm"
                          >
                            Print
                          </button>
                        </div>
                      </td>
                    </tr>

                    {expandedBillId === b._id && (
                      <tr>
                        <td colSpan={6} className="p-0 border-b">
                          <div className="p-4 sm:p-6 bg-slate-50">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
                              <div>
                                <div className="text-lg font-bold text-slate-800">{HOSPITAL.name}</div>
                                <div className="text-sm text-slate-600">{HOSPITAL.address}</div>
                                <div className="text-sm text-slate-600">
                                  Phone: {HOSPITAL.phone} | {HOSPITAL.email}
                                </div>
                              </div>
                              <div className="text-sm text-slate-600 md:text-right">
                                <div>Bill ID: {b._id}</div>
                                <div className="mt-1">
                                  {b.createdAt ? new Date(b.createdAt).toLocaleString() : "-"}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="bg-white border border-slate-200 rounded-xl p-4">
                                <div className="font-semibold text-slate-800 mb-2">Patient Details</div>
                                <div className="text-sm text-slate-700">
                                  <div><b>Name:</b> {b.patientName}</div>
                                  <div><b>Phone:</b> {b.patientPhone}</div>
                                  {b.patientAge != null && <div><b>Age:</b> {b.patientAge}</div>}
                                  {b.patientGender && <div><b>Gender:</b> {b.patientGender}</div>}
                                  {b.patientAddress && <div><b>Address:</b> {b.patientAddress}</div>}
                                </div>
                              </div>

                              <div className="bg-white border border-slate-200 rounded-xl p-4">
                                <div className="font-semibold text-slate-800 mb-2">Billing Summary</div>
                                <div className="text-sm text-slate-700 space-y-2">
                                  <div><b>Items:</b> {(b.items || []).length}</div>
                                  <div><b>Subtotal:</b> ₹{b.subtotal ?? b.total}</div>
                                  <div className="pt-2 border-t border-slate-200">
                                    <b>Total:</b> <span className="text-lg font-bold text-slate-900">₹{b.total}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
                              <table className="min-w-full text-sm">
                                <thead className="bg-slate-100">
                                  <tr>
                                    <th className="px-3 py-2 text-left border-b">Medicine</th>
                                    <th className="px-3 py-2 text-left border-b">Batch</th>
                                    <th className="px-3 py-2 text-right border-b">Qty</th>
                                    <th className="px-3 py-2 text-right border-b">Unit Price</th>
                                    <th className="px-3 py-2 text-right border-b">Line Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(b.items || []).map((it, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50">
                                      <td className="px-3 py-2 border-b">{it.name || "-"}</td>
                                      <td className="px-3 py-2 border-b">{it.batchNumber || "-"}</td>
                                      <td className="px-3 py-2 border-b text-right">
                                        {it.quantity ?? 0} {it.unit || ""}
                                      </td>
                                      <td className="px-3 py-2 border-b text-right">₹{it.unitPrice ?? 0}</td>
                                      <td className="px-3 py-2 border-b text-right">₹{it.lineTotal ?? 0}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

