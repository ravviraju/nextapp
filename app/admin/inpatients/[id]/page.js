"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Head from "next/head";
import Link from "next/link";

export default function InpatientDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [admission, setAdmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showItemModal, setShowItemModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemForm, setItemForm] = useState({
    description: "",
    category: "test", // test or medicine
    quantity: 1,
    unitPrice: 0
  });

  useEffect(() => {
    if (id) fetchAdmission();
  }, [id]);

  const fetchAdmission = async () => {
    try {
      const res = await fetch(`/api/admin/inpatients/${id}`);
      if (!res.ok) throw new Error("Failed to fetch admission details");
      const data = await res.json();
      setAdmission(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChargeSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/inpatients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addCharge", charge: itemForm })
      });
      if (!res.ok) throw new Error("Failed to add charge");
      await fetchAdmission();
      setShowItemModal(false);
      setItemForm({ ...itemForm, description: "", quantity: 1, unitPrice: 0 });
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDischarge = async () => {
    if (!confirm("Are you sure you want to discharge this patient? This will calculate final room charges and free the bed.")) return;
    try {
      const res = await fetch(`/api/admin/inpatients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "discharge" })
      });
      if (!res.ok) throw new Error("Failed to discharge");
      await fetchAdmission();
      alert("Patient Discharged Successfully. Bed is now available.");
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="text-center p-12 text-gray-500 animate-pulse">Loading IP file...</div>;
  if (error) return <div className="text-center p-12 text-red-500 bg-red-50">{error}</div>;
  if (!admission) return <div className="text-center p-12">No data found</div>;

  return (
    <>
      <Head>
        <title>{admission.patientName} | Inpatient Details</title>
      </Head>
      
      <div className="p-8 max-w-5xl mx-auto animate-in fade-in">
        <Link href="/admin/inpatients" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-6 font-medium">
          ← Back to All Admissions
        </Link>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8">
            <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${
              admission.status === 'admitted' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {admission.status}
            </span>
          </div>

          <div className="flex gap-4 items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-2xl font-bold">
              {admission.patientName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{admission.patientName}</h1>
              <p className="text-gray-500">{admission.patientAge} Years, {admission.patientGender} • {admission.patientPhone}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 rounded-xl p-6 mb-6">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Ward & Bed</p>
              <p className="font-semibold text-gray-800">{admission.bed ? `${admission.bed.wardName} - #${admission.bed.bedNumber}` : 'Unassigned'}</p>
              <p className="text-sm text-gray-500">₹{admission.bed?.dailyRate}/day</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Admitted On</p>
              <p className="font-semibold text-gray-800">{new Date(admission.admissionDate).toLocaleString()}</p>
            </div>
            {admission.dischargeDate && (
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Discharged On</p>
                <p className="font-semibold text-gray-800">{new Date(admission.dischargeDate).toLocaleString()}</p>
              </div>
            )}
          </div>
          
          {admission.status === "admitted" && (
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowItemModal(true)} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition">
                + Add Test or Medicine
              </button>
              <button onClick={handleDischarge} className="px-5 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg border border-red-200 transition">
                Discharge & Generate Bill
              </button>
            </div>
          )}
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-4 px-2">Itemized Billing</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="p-4 pl-6">Date</th>
                <th className="p-4">Description</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-center">Qty</th>
                <th className="p-4 text-right">Price</th>
                <th className="p-4 pr-6 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {admission.charges?.map((charge, i) => (
                <tr key={i} className="hover:bg-gray-50 transition">
                  <td className="p-4 pl-6 text-sm text-gray-600">{new Date(charge.date).toLocaleDateString()}</td>
                  <td className="p-4 font-medium text-gray-800">{charge.description}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${charge.category === 'test' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'}`}>
                      {charge.category}
                    </span>
                  </td>
                  <td className="p-4 text-center text-gray-600">{charge.quantity}</td>
                  <td className="p-4 text-right text-gray-600">₹{charge.unitPrice}</td>
                  <td className="p-4 pr-6 text-right font-semibold text-gray-800">₹{charge.amount}</td>
                </tr>
              ))}
              {admission.dischargeDate && (
                <tr className="bg-blue-50/50">
                  <td className="p-4 pl-6 text-sm text-gray-600">{new Date(admission.dischargeDate).toLocaleDateString()}</td>
                  <td className="p-4 font-bold text-blue-800">Room Charges (Auto-calculated duration)</td>
                  <td className="p-4"><span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700">Room</span></td>
                  <td className="p-4 text-center">-</td>
                  <td className="p-4 text-right">₹{admission.bed?.dailyRate}/day</td>
                  <td className="p-4 pr-6 text-right font-bold text-blue-800">₹{admission.roomCharges}</td>
                </tr>
              )}
              {(!admission.charges || admission.charges.length === 0) && !admission.dischargeDate && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">No items billed yet.</td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-gray-900 border-t border-gray-200">
              <tr>
                <td colSpan="5" className="p-4 pl-6 text-right font-bold text-gray-200 text-lg">Total Due</td>
                <td className="p-4 pr-6 text-right font-bold text-emerald-400 text-xl tracking-tight">₹{admission.totalBill?.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Add Item Modal */}
        {showItemModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-xl font-bold text-gray-800">Charge To IP File</h3>
                <button onClick={() => setShowItemModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleChargeSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Item Category</label>
                  <select 
                    required 
                    value={itemForm.category} 
                    onChange={e => setItemForm({...itemForm, category: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="test">Diagnostic Test</option>
                    <option value="medicine">Medicine</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description/Item Name</label>
                  <input type="text" required value={itemForm.description} onChange={e => setItemForm({...itemForm, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g. CBC Test / Paracetamol" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity</label>
                    <input type="number" required min="1" value={itemForm.quantity} onChange={e => setItemForm({...itemForm, quantity: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Unit Price (₹)</label>
                    <input type="number" required min="0" value={itemForm.unitPrice} onChange={e => setItemForm({...itemForm, unitPrice: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                  <button type="button" onClick={() => setShowItemModal(false)} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {isSubmitting ? "Adding..." : `Add Charge (₹${itemForm.quantity * itemForm.unitPrice})`}
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
