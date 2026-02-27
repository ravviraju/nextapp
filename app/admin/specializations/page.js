"use client";

import { useEffect, useState } from "react";

export default function AdminSpecializationsPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchSpecializations = async () => {
    try {
      setListLoading(true);
      const res = await fetch("/api/specializations");
      const data = await res.json();
      if (data.success) {
        setSpecializations(data.specializations || []);
      } else {
        alert(data.message || "Failed to load specializations");
      }
    } catch (err) {
      console.error("Error fetching specializations", err);
      alert("Error fetching specializations");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecializations();
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (!name) {
      alert("Name is required");
      return;
    }

    try {
      setLoading(true);
      const payload = { name, description };

      let res;
      if (editId) {
        res = await fetch(`/api/specializations/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/specializations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.success) {
        alert(editId ? "Specialization updated" : "Specialization created");
        resetForm();
        fetchSpecializations();
      } else {
        alert(data.message || "Failed to save specialization");
      }
    } catch (err) {
      console.error("Error saving specialization", err);
      alert("Error saving specialization");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (spec) => {
    setEditId(spec._id);
    setName(spec.name || "");
    setDescription(spec.description || "");
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">
          {editId ? "Edit Specialization" : "Add Specialization"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <input
            type="text"
            placeholder="Name"
            className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Description (optional)"
            className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed w-full"
            >
              {loading ? "Saving..." : editId ? "Update" : "Add"}
            </button>
            {editId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition w-full"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Specializations</h2>
          <button
            onClick={fetchSpecializations}
            disabled={listLoading}
            className="text-sm bg-gray-100 px-3 py-2 rounded-md border hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {listLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {specializations.length === 0 ? (
          <p className="text-gray-500">No specializations found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border-b text-left">Name</th>
                  <th className="px-4 py-2 border-b text-left">Description</th>
                  <th className="px-4 py-2 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {specializations.map((spec) => (
                  <tr key={spec._id}>
                    <td className="px-4 py-2 border-b">{spec.name}</td>
                    <td className="px-4 py-2 border-b">
                      {spec.description || "-"}
                    </td>
                    <td className="px-4 py-2 border-b">
                      <button
                        onClick={() => handleEditClick(spec)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Edit
                      </button>
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

