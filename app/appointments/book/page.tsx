"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BookAppointmentPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const res = await fetch("/api/doctors");
        const data = await res.json();
        if (data.success) {
          setDoctors(data.doctors || []);
        } else {
          setError(data.message || "Failed to load doctors");
        }
      } catch (err) {
        console.error("Load doctors error", err);
        setError("Failed to load doctors");
      } finally {
        setLoadingDoctors(false);
      }
    };
    loadDoctors();
  }, []);

  const handleBook = async () => {
    if (!doctorId || !date || !time) {
      alert("Doctor, date and time are required");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId,
          date,
          time,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (res.status === 401) {
          alert("Please login to book an appointment");
          router.push("/login");
          return;
        }
        alert(data.message || "Failed to book appointment");
      } else {
        alert("Appointment booked successfully");
        router.push("/appointments");
      }
    } catch (err) {
      console.error("Book appointment error", err);
      alert("Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            Book an Appointment
          </h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg px-3 py-1 hover:bg-slate-100 transition"
            >
              Logout
            </button>
            <Link
              href="/appointments"
              className="text-sm text-blue-600 hover:underline"
            >
              Back to My Appointments
            </Link>
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm mb-4">
            {typeof error === "string" ? error : "Something went wrong"}
          </p>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              disabled={loadingDoctors}
            >
              <option value="">
                {loadingDoctors ? "Loading doctors..." : "Select doctor"}
              </option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}{" "}
                  {d.specialization?.name
                    ? `(${d.specialization.name})`
                    : ""}
                </option>
              ))}
            </select>

            <input
              type="date"
              className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <input
              type="time"
              className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />

            <textarea
              placeholder="Notes (optional - symptoms, preferences, etc.)"
              className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 md:col-span-2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleBook}
              disabled={loading}
              className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Booking..." : "Book Appointment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

