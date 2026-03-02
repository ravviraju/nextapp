"use client";

import { useEffect, useState } from "react";

export default function AdminAppointmentsPage() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  const fetchDoctors = async () => {
    try {
      const res = await fetch("/api/doctors");
      const data = await res.json();
      if (data.success) {
        setDoctors(data.doctors || []);
      } else {
        alert(data.message || "Failed to load doctors");
      }
    } catch (err) {
      console.error("Error fetching doctors", err);
      alert("Error fetching doctors");
    }
  };

  const fetchAppointments = async () => {
    try {
      setListLoading(true);
      const res = await fetch("/api/appointments");
      const data = await res.json();
      if (data.success) {
        setAppointments(data.appointments || []);
      } else {
        alert(data.message || "Failed to load appointments");
      }
    } catch (err) {
      console.error("Error fetching appointments", err);
      alert("Error fetching appointments");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, []);

  const resetForm = () => {
    setDoctorId("");
    setDate("");
    setTime("");
    setPatientName("");
    setPatientPhone("");
    setNotes("");
  };

  const handleCreate = async () => {
    if (!doctorId || !date || !time) {
      alert("Doctor, date and time are required");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId,
          date,
          time,
          patientName,
          patientPhone,
          notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Appointment created");
        resetForm();
        fetchAppointments();
      } else {
        alert(data.message || "Failed to create appointment");
      }
    } catch (err) {
      console.error("Error creating appointment", err);
      alert("Error creating appointment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Add Appointment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
          >
            <option value="">Select doctor</option>
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
          <input
            type="text"
            placeholder="Patient name (optional)"
            className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Patient phone (optional)"
            className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={patientPhone}
            onChange={(e) => setPatientPhone(e.target.value)}
          />
          <textarea
            placeholder="Notes (optional)"
            className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 md:col-span-2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleCreate}
            disabled={saving}
            className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Add Appointment"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="w-full max-w-4xl bg-white shadow-lg rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Appointments</h2>
          <button
            onClick={fetchAppointments}
            disabled={listLoading}
            className="text-sm bg-gray-100 px-3 py-2 rounded-md border hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {listLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {appointments.length === 0 ? (
          <p className="text-gray-500">No appointments found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border-b text-left">Doctor</th>
                  <th className="px-4 py-2 border-b text-left">
                    Specialization
                  </th>
                  <th className="px-4 py-2 border-b text-left">Date</th>
                  <th className="px-4 py-2 border-b text-left">Time</th>
                  <th className="px-4 py-2 border-b text-left">Patient</th>
                  <th className="px-4 py-2 border-b text-left">Phone</th>
                  <th className="px-4 py-2 border-b text-left">Status</th>
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
                    <td className="px-4 py-2 border-b">
                      {a.patientName || "-"}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {a.patientPhone || "-"}
                    </td>
                    <td className="px-4 py-2 border-b">
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

