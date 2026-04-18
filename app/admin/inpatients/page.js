"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function InpatientsAdmin() {
  const router = useRouter();
  const [admissions, setAdmissions] = useState([]);
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patientName: "",
    patientPhone: "",
    patientAge: "",
    patientGender: "",
    address: "",
    bedId: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [admRes, bedsRes] = await Promise.all([
        fetch("/api/admin/inpatients"),
        fetch("/api/admin/beds")
      ]);
      
      if (!admRes.ok || !bedsRes.ok) throw new Error("Failed to fetch data");
      
      const admData = await admRes.json();
      const bedsData = await bedsRes.json();
      
      setAdmissions(admData);
      setBeds(bedsData.filter(b => b.status === "available"));
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
      const res = await fetch("/api/admin/inpatients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          patientAge: Number(formData.patientAge)
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to admit patient");
      }
      
      await fetchData();
      setShowModal(false);
      setFormData({
        patientName: "", patientPhone: "", patientAge: "", patientGender: "", address: "", bedId: ""
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Inpatients | Admin</title>
      </Head>
      
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-gray-100">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              In-Patient Admissions
            </h1>
            <p className="text-gray-500 mt-2">Manage running IPs, assign beds, add tests and discharge.</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-4">
             <Link href="/admin/beds" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium">
               Manage Beds
             </Link>
             <button 
               onClick={() => setShowModal(true)}
               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md font-medium transition"
             >
               + Admit Patient
             </button>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-12 text-gray-500 animate-pulse">Loading admissions...</div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg">Error: {error}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {admissions.length === 0 ? (
              <div className="col-span-full text-center p-12 bg-white rounded-2xl shadow-sm tracking-wide text-gray-500">
                No active or past admissions found.
              </div>
            ) : (
              admissions.map(adm => (
                <div key={adm._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex flex-col h-full transform hover:-translate-y-1 duration-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{adm.patientName}</h3>
                      <p className="text-sm text-gray-500">{adm.patientGender}, {adm.patientAge} yrs • {adm.patientPhone}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                      adm.status === 'admitted' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {adm.status}
                    </span>
                  </div>
                  
                  <div className="flex bg-gray-50 rounded-xl p-3 mb-4 mt-auto">
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 font-semibold uppercase">Bed Assigned</p>
                      <p className="text-sm text-gray-700 font-medium">
                        {adm.bed ? `${adm.bed.wardName} - #${adm.bed.bedNumber}` : 'Unassigned'}
                      </p>
                    </div>
                    <div className="flex-1 border-l border-gray-200 pl-3">
                      <p className="text-xs text-gray-400 font-semibold uppercase">Admitted</p>
                      <p className="text-sm text-gray-700 font-medium whitespace-nowrap">
                        {new Date(adm.admissionDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Current Bill</p>
                      <p className="text-xl font-bold text-emerald-600">₹{adm.totalBill.toLocaleString()}</p>
                    </div>
                    <Link 
                      href={`/admin/inpatients/${adm._id}`}
                      className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition"
                    >
                      Manage IP
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Admit Patient Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden my-8" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-xl font-bold tracking-tight text-gray-800">Admit New Patient</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Patient Name</label>
                    <input type="text" name="patientName" required value={formData.patientName} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                    <input type="text" name="patientPhone" required value={formData.patientPhone} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Age</label>
                    <input type="number" name="patientAge" required value={formData.patientAge} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
                    <select name="patientGender" required value={formData.patientGender} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Gender...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Assign Bed</label>
                    <select name="bedId" required value={formData.bedId} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50">
                      <option value="">Select an available bed...</option>
                      {beds.map(bed => (
                        <option key={bed._id} value={bed._id}>
                          {bed.wardName} - #{bed.bedNumber} (₹{bed.dailyRate}/day)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
                    <textarea name="address" required value={formData.address} onChange={handleInputChange} rows={2} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                
                {beds.length === 0 && (
                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100 mt-2">
                    ⚠️ No available beds! Please <Link href="/admin/beds" className="underline font-bold">add a bed</Link> safely before admitting.
                  </div>
                )}

                <div className="mt-8 flex justify-end gap-3 pt-5 border-t border-gray-100">
                  <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium">Cancel</button>
                  <button type="submit" disabled={isSubmitting || beds.length === 0} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50">
                    {isSubmitting ? "Admitting..." : "Complete Admission"}
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
