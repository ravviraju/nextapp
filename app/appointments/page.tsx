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
        const res = await fetch("/api/my-appointments");
        const data = await res.json();
        if (!res.ok || !data.success) {
          if (res.status === 401) {
            setError("not-auth");
          } else {
            setError(data.message || "Failed to load appointments");
          }
          setAppointments([]);
        } else {
          setAppointments(data.appointments || []);
          setError(null);
        }
      } catch (err) {
        console.error("Load appointments error", err);
        setError("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading your appointments...</p>
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
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            My Appointments
          </h1>
          <Link
            href="/appointments/book"
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Book New Appointment
          </Link>
        </div>

        {error && (
          <p className="text-red-600 text-sm mb-4">
            {typeof error === "string" ? error : "Something went wrong"}
          </p>
        )}

        {appointments.length === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 text-center">
            <p className="text-slate-500 mb-4">
              You have no appointments booked yet.
            </p>
            <Link
              href="/appointments/book"
              className="text-blue-600 hover:underline"
            >
              Book your first appointment
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-2 text-left border-b">Doctor</th>
                  <th className="px-4 py-2 text-left border-b">
                    Specialization
                  </th>
                  <th className="px-4 py-2 text-left border-b">Date</th>
                  <th className="px-4 py-2 text-left border-b">Time</th>
                  <th className="px-4 py-2 text-left border-b">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a._id}>
                    <td className="px-4 py-2 border-b">
                      {a.doctor?.name || "-"}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {a.specialization?.name || "-"}
                    </td>
                    <td className="px-4 py-2 border-b">{a.date}</td>
                    <td className="px-4 py-2 border-b">{a.time}</td>
                    <td className="px-4 py-2 border-b capitalize">
                      {a.status || "scheduled"}
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

