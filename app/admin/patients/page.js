"use client";

import { useEffect, useState } from "react";
import Head from "next/head";

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/patients");
      const data = await res.json();
      if (data.success) {
        setPatients(data.patients || []);
      } else {
        setError(data.message || "Failed to load patients");
      }
    } catch (err) {
      console.error("Error fetching patients", err);
      setError("Error fetching patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((p) => {
    const term = search.toLowerCase();
    const nameMatch = p.name && p.name.toLowerCase().includes(term);
    const phoneMatch = p.phone && p.phone.toLowerCase().includes(term);
    return nameMatch || phoneMatch;
  });

  return (
    <>
      <Head>
        <title>Manage Patients | Admin</title>
      </Head>
      <div className="p-6 md:p-8 min-h-[calc(100vh-4rem)] bg-gray-50 flex flex-col">
        <div className="max-w-6xl w-full mx-auto space-y-6 flex-1">
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Patients Directory</h1>
              <p className="text-slate-500 mt-1 text-sm">
                A unified list of all patients who have scheduled an appointment from Admin or Web.
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search name or phone..."
                className="w-full md:w-64 border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-400 shadow-sm transition"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                onClick={fetchPatients}
                disabled={loading}
                className="bg-white border rounded-xl px-4 py-2 shadow-sm text-sm font-medium hover:bg-gray-50 flex-shrink-0 transition"
              >
                {loading ? "..." : "Refresh"}
              </button>
            </div>
          </header>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <div className="bg-white shadow-sm border rounded-2xl overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto flex-1">
              {loading ? (
                <div className="p-12 text-center text-slate-500 animate-pulse">Loading patient records...</div>
              ) : filteredPatients.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  {search ? "No patients match your search criteria." : "No patient records found in the database."}
                </div>
              ) : (
                <table className="min-w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 border-b text-slate-700">
                    <tr>
                      <th className="px-6 py-4 font-semibold whitespace-nowrap">Patient Name</th>
                      <th className="px-6 py-4 font-semibold whitespace-nowrap">Phone / Contact</th>
                      <th className="px-6 py-4 font-semibold whitespace-nowrap">Total Appointments</th>
                      <th className="px-6 py-4 font-semibold whitespace-nowrap">Last Visit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPatients.map((p, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-800">
                          {p.name || "Unknown"}
                          {p.email && <div className="text-xs text-slate-400 font-normal mt-0.5">{p.email}</div>}
                        </td>
                        <td className="px-6 py-4">
                          {p.phone || <span className="text-slate-400 italic">Not provided</span>}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedPatient(p)}
                            className="inline-flex items-center justify-center bg-blue-50 text-blue-700 min-w-[2rem] h-6 px-2 rounded-full font-bold text-xs hover:bg-blue-100 transition"
                          >
                            {p.appointmentCount} {p.appointmentCount === 1 ? "time" : "times"}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {p.lastAppointmentDate ? (
                            <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-medium">
                              {p.lastAppointmentDate}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          <div className="text-sm text-slate-400 text-center pb-4">
            Showing {filteredPatients.length} unique patients aggregated from appointment history.
          </div>
        </div>
      </div>

      {/* Visited Appointments Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Visited Appointments
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Patient: <span className="font-medium text-slate-700">{selectedPatient.name || "Unknown"}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="text-slate-400 hover:text-slate-600 transition bg-slate-100 hover:bg-slate-200 p-2 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {selectedPatient.appointments && selectedPatient.appointments.length > 0 ? (
                <div className="space-y-4">
                  {selectedPatient.appointments.map((appt, idx) => (
                    <div key={idx} className="p-4 border rounded-xl shadow-sm bg-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex flex-col">
                        <div className="font-semibold text-slate-800 flex items-center gap-2">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {appt.date} {appt.time && <span className="text-slate-500 text-sm font-normal">at {appt.time}</span>}
                        </div>
                        <div className="text-sm text-slate-600 mt-2 flex items-center gap-2">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Doctor: <span className="font-medium text-slate-700">{appt.doctorName || "Not assigned"}</span>
                        </div>
                      </div>
                      <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                          appt.status === "completed" ? "bg-green-100 text-green-700 border border-green-200" :
                          appt.status === "cancelled" ? "bg-red-100 text-red-700 border border-red-200" :
                          "bg-amber-100 text-amber-700 border border-amber-200"
                        }`}>
                          {appt.status || "pending"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center flex flex-col items-center justify-center py-12">
                  <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-slate-500 font-medium">No appointment details found.</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-slate-50 flex justify-end rounded-b-2xl">
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-6 py-2.5 bg-white border shadow-sm text-slate-700 font-semibold rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors focus:ring-2 focus:ring-slate-200 outline-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
