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
        if (!res.ok || !data.success) {
          setError(data.message || "Failed to load doctors");
          setDoctors([]);
          return;
        }
        setDoctors(data.doctors || []);
        setError(null);
      } catch (err) {
        console.error("Load doctors error", err);
        setError("Failed to load doctors");
        setDoctors([]);
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

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Book an Appointment
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Choose a doctor and pick a date and time.
          </p>
        </div>
        <Link
          href="/appointments"
          className="text-sm text-blue-600 hover:underline"
        >
          Back to My Appointments
        </Link>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Doctor
            </label>
            <select
              className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              disabled={loadingDoctors}
            >
              <option value="">
                {loadingDoctors ? "Loading doctors..." : "Select doctor"}
              </option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                  {d.specialization?.name ? ` (${d.specialization.name})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Date
            </label>
            <input
              type="date"
              className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Time
            </label>
            <input
              type="time"
              className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              placeholder="Symptoms, preferences, etc."
              className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[96px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleBook}
            disabled={loading}
            className="inline-flex items-center justify-center bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Booking..." : "Book Appointment"}
          </button>
          <p className="text-xs text-slate-500 sm:self-center">
            You’ll be asked to login if you’re not signed in.
          </p>
        </div>
      </div>
    </div>
  );
}

