"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/my-appointments", {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          // For any error, require login
          setError("not-auth");
          setAppointments([]);
          return;
        }
        setAppointments(data.appointments || []);
        setError(null);
      } catch (err) {
        console.error("Load appointments error", err);
        setError("not-auth");
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-14">
        <p className="text-slate-600">Loading your appointments...</p>
      </div>
    );
  }

  if (error === "not-auth") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Please login to view your appointments
          </h2>
          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="text-blue-600 hover:underline text-sm"
            >
              New user? Register here
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Appointments</h1>
          <p className="text-sm text-slate-500 mt-1">
            View and manage your booked appointments.
          </p>
        </div>
        <Link
          href="/appointments/book"
          className="inline-flex items-center justify-center text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Book New Appointment
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center">
          <p className="text-slate-600 mb-4">
            You have no appointments booked yet.
          </p>
          <Link href="/appointments/book" className="text-blue-600 hover:underline">
            Book your first appointment
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left border-b">Doctor</th>
                  <th className="px-4 py-3 text-left border-b">Specialization</th>
                  <th className="px-4 py-3 text-left border-b">Date</th>
                  <th className="px-4 py-3 text-left border-b">Time</th>
                  <th className="px-4 py-3 text-left border-b font-bold text-blue-600">Token</th>
                  <th className="px-4 py-3 text-left border-b">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 border-b font-medium text-slate-800">
                      {a.doctor?.name || "-"}
                    </td>
                    <td className="px-4 py-3 border-b text-slate-600">
                      {a.specialization?.name || "-"}
                    </td>
                    <td className="px-4 py-3 border-b text-slate-600">{a.date}</td>
                    <td className="px-4 py-3 border-b text-slate-600">{a.time}</td>
                    <td className="px-4 py-3 border-b">
                      {a.tokenNumber ? (
                        <div className="inline-flex items-center justify-center font-bold text-sm bg-blue-100 text-blue-800 h-8 w-10 rounded-lg">
                          #{a.tokenNumber}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 border-b">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-700 capitalize">
                        {a.status || "scheduled"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden grid grid-cols-1 gap-3">
            {appointments.map((a) => (
              <div
                key={a._id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-800">
                      {a.doctor?.name || "-"}
                    </div>
                    <div className="text-sm text-slate-500">
                      {a.specialization?.name || "-"}
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-700 capitalize">
                    {a.status || "scheduled"}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="text-slate-500">Date</div>
                  <div className="text-slate-800 text-right">{a.date}</div>
                  <div className="text-slate-500">Time</div>
                  <div className="text-slate-800 text-right">{a.time}</div>
                  <div className="text-slate-500 font-bold">Token Number</div>
                  <div className="text-right">
                    {a.tokenNumber ? (
                      <span className="font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded-md">#{a.tokenNumber}</span>
                    ) : (
                      "-"
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

