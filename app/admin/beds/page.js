"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";

export default function BedsAdmin() {
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    wardName: "",
    bedNumber: "",
    dailyRate: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchBeds();
  }, []);

  const fetchBeds = async () => {
    try {
      const res = await fetch("/api/admin/beds");
      if (!res.ok) throw new Error("Failed to fetch beds");
      const data = await res.json();
      setBeds(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/beds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error("Failed to create bed");
      
      await fetchBeds();
      setShowModal(false);
      setFormData({ wardName: "", bedNumber: "", dailyRate: "" });
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Manage Beds | Admin</title>
      </Head>
      
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-gray-100">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              Bed Management
            </h1>
            <p className="text-gray-500 mt-2">Manage wards, beds and daily rates</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-4">
             <Link href="/admin/inpatients" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium">
               Inpatient List
             </Link>
             <button 
               onClick={() => setShowModal(true)}
               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md font-medium transition"
             >
               + Add New Bed
             </button>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-12 text-gray-500 animate-pulse">Loading beds data...</div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg">Error: {error}</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm font-semibold uppercase tracking-wider">
                  <th className="p-4 pl-6">Ward Name</th>
                  <th className="p-4">Bed Number</th>
                  <th className="p-4">Daily Rate (₹)</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {beds.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500">No beds found. Add some beds to get started.</td>
                  </tr>
                ) : (
                  beds.map(bed => (
                    <tr key={bed._id} className="hover:bg-gray-50 transition-colors group">
                      <td className="p-4 pl-6 font-medium text-gray-800">{bed.wardName}</td>
                      <td className="p-4 text-gray-600 font-medium">#{bed.bedNumber}</td>
                      <td className="p-4 text-emerald-600 font-medium">₹{bed.dailyRate}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          bed.status === 'available' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {bed.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-xl font-bold tracking-tight text-gray-800">Add New Bed</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Ward Name</label>
                  <input
                    type="text"
                    name="wardName"
                    required
                    value={formData.wardName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="e.g. General Ward A"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Bed Number</label>
                    <input
                      type="text"
                      name="bedNumber"
                      required
                      value={formData.bedNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      placeholder="e.g. 101"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Daily Rate (₹)</label>
                    <input
                      type="number"
                      name="dailyRate"
                      required
                      min="0"
                      value={formData.dailyRate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      placeholder="500"
                    />
                  </div>
                </div>
                <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? "Creating..." : "Save Bed"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
