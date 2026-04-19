"use client";

import { useEffect, useState } from "react";
import Head from "next/head";

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

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
                          <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 min-w-[2rem] h-6 px-2 rounded-full font-bold text-xs">
                            {p.appointmentCount} {p.appointmentCount === 1 ? "time" : "times"}
                          </span>
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
    </>
  );
}
