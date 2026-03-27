"use client";

import { useEffect, useState } from "react";

export default function PharmaInventoryPage() {
  const [items, setItems] = useState([]);

  const [name, setName] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [unit, setUnit] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");

  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchItems = async () => {
    try {
      setLoadingList(true);
      const res = await fetch("/api/pharma-inventory");
      const data = await res.json();
      if (data.success) setItems(data.items || []);
      else alert(data.message || "Failed to load inventory");
    } catch (e) {
      console.error("fetchItems error", e);
      alert("Failed to load inventory");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const resetForm = () => {
    setEditId(null);
    setName("");
    setBatchNumber("");
    setExpiryDate("");
    setUnit("");
    setQuantity("");
    setUnitPrice("");
  };

  const handleSubmit = async () => {
    if (!name || !batchNumber) {
      alert("name and batchNumber are required");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name,
        batchNumber,
        expiryDate,
        unit,
        quantity: Number(quantity || 0),
        unitPrice: Number(unitPrice || 0),
      };

      let res;
      if (editId) {
        res = await fetch(`/api/pharma-inventory/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/pharma-inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || "Failed to save inventory item");
        return;
      }

      alert(editId ? "Inventory updated" : "Inventory created");
      resetForm();
      fetchItems();
    } catch (e) {
      console.error("handleSubmit error", e);
      alert("Failed to save inventory item");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (it) => {
    setEditId(it._id);
    setName(it.name || "");
    setBatchNumber(it.batchNumber || "");
    setExpiryDate(it.expiryDate || "");
    setUnit(it.unit || "");
    setQuantity(String(it.quantity ?? 0));
    setUnitPrice(String(it.unitPrice ?? 0));
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this inventory item?")) return;
    try {
      const res = await fetch(`/api/pharma-inventory/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || "Failed to delete");
        return;
      }
      alert("Deleted");
      resetForm();
      fetchItems();
    } catch (e) {
      console.error("delete error", e);
      alert("Failed to delete");
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full">
      <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
          Pharma Inventory
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Drug name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Batch number"
            value={batchNumber}
            onChange={(e) => setBatchNumber(e.target.value)}
          />
          <input
            type="date"
            className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
          <input
            className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Unit (e.g. tablets)"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />
          <input
            type="number"
            className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Quantity available"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          <input
            type="number"
            className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Unit price"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
          />
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : editId ? "Update Item" : "Add Item"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-slate-200 text-slate-800 py-3 px-4 rounded-lg hover:bg-slate-300 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 bg-white shadow-sm border border-slate-200 rounded-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-slate-800">
            Inventory List
          </h3>
          <button
            onClick={fetchItems}
            disabled={loadingList}
            className="text-sm bg-slate-100 px-3 py-2 rounded-lg border hover:bg-slate-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loadingList ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {items.length === 0 ? (
          <p className="text-slate-500">No inventory items found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left border-b">Drug</th>
                  <th className="px-3 py-2 text-left border-b">Batch</th>
                  <th className="px-3 py-2 text-left border-b">Expiry</th>
                  <th className="px-3 py-2 text-left border-b">Qty</th>
                  <th className="px-3 py-2 text-left border-b">Unit Price</th>
                  <th className="px-3 py-2 text-left border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it._id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 border-b font-medium text-slate-800">
                      {it.name}
                    </td>
                    <td className="px-3 py-2 border-b">{it.batchNumber}</td>
                    <td className="px-3 py-2 border-b">{it.expiryDate || "-"}</td>
                    <td className="px-3 py-2 border-b">
                      {it.quantity ?? 0} {it.unit || ""}
                    </td>
                    <td className="px-3 py-2 border-b">{it.unitPrice ?? 0}</td>
                    <td className="px-3 py-2 border-b">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(it)}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(it._id)}
                          className="text-red-600 hover:underline text-sm"
                        >
                          Delete
                        </button>
                      </div>
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

