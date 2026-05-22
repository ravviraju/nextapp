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
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [billAppointment, setBillAppointment] = useState(null);

  // Reschedule state
  const [rescheduleAppointment, setRescheduleAppointment] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [loadingRescheduleSlots, setLoadingRescheduleSlots] = useState(false);
  const [savingReschedule, setSavingReschedule] = useState(false);

  useEffect(() => {
    if (doctorId && date) {
      const fetchSlots = async () => {
        setLoadingSlots(true);
        try {
          const res = await fetch(`/api/doctors/slots?doctorId=${doctorId}&date=${date}`);
          const data = await res.json();
          if (data.success) {
            setAvailableSlots(data.slots || []);
            // Only reset time if current time is not in available slots
            setTime(prev => (data.slots || []).includes(prev) ? prev : "");
          }
        } catch (err) {
          console.error("Error fetching slots", err);
        } finally {
          setLoadingSlots(false);
        }
      };
      fetchSlots();
    } else {
      setAvailableSlots([]);
      setTime("");
    }
  }, [doctorId, date]);

  useEffect(() => {
    if (rescheduleAppointment && rescheduleDate) {
      const fetchSlots = async () => {
        setLoadingRescheduleSlots(true);
        try {
          const res = await fetch(`/api/doctors/slots?doctorId=${rescheduleAppointment.doctorId}&date=${rescheduleDate}`);
          const data = await res.json();
          if (data.success) {
            setRescheduleSlots(data.slots || []);
            setRescheduleTime(prev => (data.slots || []).includes(prev) ? prev : "");
          }
        } catch (err) {
          console.error("Error fetching reschedule slots", err);
        } finally {
          setLoadingRescheduleSlots(false);
        }
      };
      fetchSlots();
    } else {
      setRescheduleSlots([]);
      setRescheduleTime("");
    }
  }, [rescheduleAppointment, rescheduleDate]);

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

  const handleCancel = async (id) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAppointments();
      } else {
        alert(data.message || "Failed to cancel appointment");
      }
    } catch (err) {
      console.error("Error cancelling appointment", err);
      alert("Error cancelling appointment");
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!rescheduleDate || !rescheduleTime) {
      alert("Please select a new date and time");
      return;
    }

    try {
      setSavingReschedule(true);
      const res = await fetch(`/api/appointments/${rescheduleAppointment._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reschedule",
          doctorId: rescheduleAppointment.doctorId,
          date: rescheduleDate,
          time: rescheduleTime
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Appointment rescheduled successfully");
        setRescheduleAppointment(null);
        fetchAppointments();
      } else {
        alert(data.message || "Failed to reschedule appointment");
      }
    } catch (err) {
      console.error("Error rescheduling appointment", err);
      alert("Error rescheduling appointment");
    } finally {
      setSavingReschedule(false);
    }
  };

  const BillContent = ({ appointment }) => {
    if (!appointment) return null;
    return (
      <div className="max-w-2xl mx-auto border-2 border-gray-800 p-8 rounded-lg bg-white text-black">
        <div className="text-center mb-8 border-b-2 border-gray-800 pb-4">
          <h1 className="text-3xl font-bold uppercase tracking-wider">City Health Clinic</h1>
          <p className="text-gray-600 mt-2">123 Wellness Avenue, Medical District, City 10001</p>
          <p className="text-gray-600">Phone: +1 234 567 8900 | Email: contact@cityhealth.com</p>
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-6">Payment Receipt</h2>
        
        <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
          <div>
            <p><span className="font-semibold">Receipt No:</span> REC-{appointment._id.slice(-6).toUpperCase()}</p>
            <p><span className="font-semibold">Date of Issue:</span> {new Date().toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <p><span className="font-semibold">Appointment Date:</span> {appointment.date}</p>
            <p><span className="font-semibold">Time:</span> {appointment.time}</p>
          </div>
        </div>

        <div className="border border-gray-300 rounded-lg p-5 mb-8 bg-gray-50">
          <h3 className="font-bold text-lg mb-4 border-b border-gray-200 pb-2">Patient Details</h3>
          <div className="grid grid-cols-2 gap-y-3 gap-x-4">
            <p><span className="font-semibold text-gray-600">Name:</span> {appointment.patientName || "Walk-in Patient"}</p>
            <p><span className="font-semibold text-gray-600">Phone:</span> {appointment.patientPhone || "N/A"}</p>
            <p><span className="font-semibold text-gray-600">Consulting Doctor:</span> {appointment.doctor?.name || "N/A"}</p>
            <p><span className="font-semibold text-gray-600">Department:</span> {appointment.specialization?.name || "General"}</p>
          </div>
        </div>

        <table className="w-full mb-8 border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-3 text-left">Description</th>
              <th className="border border-gray-300 p-3 text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-3">Doctor Consultation Fee</td>
              <td className="border border-gray-300 p-3 text-right font-medium">{appointment.fee || 0}</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-300 p-3 text-right font-bold">Total Paid Amount:</td>
              <td className="border border-gray-300 p-3 text-right text-lg font-bold">₹{appointment.fee || 0}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-16 flex justify-between items-end">
          <div>
            <p className="text-sm text-gray-500 italic">This is a computer-generated receipt.</p>
          </div>
          <div className="text-center">
            <div className="border-b border-gray-800 w-48 mb-2"></div>
            <p className="font-semibold">Authorized Signatory</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6 print:hidden">
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
          <div className="relative">
            <select
              className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={!doctorId || !date || loadingSlots}
            >
              <option value="">{loadingSlots ? "Loading slots..." : "Select time"}</option>
              {availableSlots.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
            {!loadingSlots && doctorId && date && availableSlots.length === 0 && (
              <span className="absolute -bottom-5 left-1 text-xs text-red-500 font-medium tracking-tight">
                No slots available
              </span>
            )}
          </div>
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
                  <th className="px-4 py-2 border-b text-left">Paid Amt</th>
                  <th className="px-4 py-2 border-b text-center">Actions</th>
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
                      {a.status === "cancelled" ? (
                        <span className="text-red-600 font-semibold">Cancelled</span>
                      ) : (
                        <span className="capitalize">{a.status || "scheduled"}</span>
                      )}
                    </td>
                    <td className="px-4 py-2 border-b font-medium text-green-600">
                      ₹{a.fee || 0}
                    </td>
                    <td className="px-4 py-2 border-b text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setRescheduleAppointment(a);
                            setRescheduleDate(a.date);
                          }}
                          disabled={a.status === "cancelled"}
                          className="inline-flex items-center gap-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-blue-600 px-2 py-1 rounded-lg text-xs font-medium shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Reschedule"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => handleCancel(a._id)}
                          disabled={a.status === "cancelled"}
                          className="inline-flex items-center gap-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-red-600 px-2 py-1 rounded-lg text-xs font-medium shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Cancel"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => setBillAppointment(a)}
                          className="inline-flex items-center gap-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-green-600 px-2 py-1 rounded-lg text-xs font-medium shadow-sm transition"
                          title="Print Bill"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2-2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2-2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2-2v4h10z" /></svg>
                          Bill
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>

    {/* Bill Preview Modal (Screen only) */}
    {billAppointment && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 print:hidden backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
          <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
            <h2 className="text-xl font-bold text-gray-800">Bill Preview</h2>
            <button 
              onClick={() => setBillAppointment(null)} 
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="p-6 overflow-y-auto bg-gray-100 flex-1">
             <BillContent appointment={billAppointment} />
          </div>
          <div className="p-4 border-t bg-white flex justify-end gap-3 rounded-b-2xl">
            <button 
              onClick={() => setBillAppointment(null)} 
              className="px-5 py-2 border border-gray-300 font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button 
              onClick={() => window.print()} 
              className="px-6 py-2 bg-blue-600 font-medium text-white rounded-xl shadow-sm hover:bg-blue-700 hover:shadow transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2-2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2-2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2-2v4h10z" /></svg>
              Print Bill
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Reschedule Modal */}
    {rescheduleAppointment && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 print:hidden backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col animate-in fade-in zoom-in duration-200">
          <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
            <h2 className="text-xl font-bold text-gray-800">Reschedule Appointment</h2>
            <button 
              onClick={() => setRescheduleAppointment(null)} 
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Rescheduling appointment for <strong>{rescheduleAppointment.patientName || "Patient"}</strong> with Dr. <strong>{rescheduleAppointment.doctor?.name}</strong>.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Date</label>
                <input
                  type="date"
                  className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Time</label>
                <select
                  className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  disabled={!rescheduleDate || loadingRescheduleSlots}
                >
                  <option value="">{loadingRescheduleSlots ? "Loading slots..." : "Select time"}</option>
                  {rescheduleSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
                {!loadingRescheduleSlots && rescheduleDate && rescheduleSlots.length === 0 && (
                  <p className="mt-1 text-xs text-red-500 font-medium tracking-tight">
                    No slots available for this date.
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
            <button 
              onClick={() => setRescheduleAppointment(null)} 
              disabled={savingReschedule}
              className="px-5 py-2 border border-gray-300 font-medium text-gray-700 rounded-xl hover:bg-gray-100 transition disabled:opacity-60"
            >
              Cancel
            </button>
            <button 
              onClick={handleRescheduleSubmit} 
              disabled={savingReschedule || !rescheduleDate || !rescheduleTime}
              className="px-6 py-2 bg-blue-600 font-medium text-white rounded-xl shadow-sm hover:bg-blue-700 hover:shadow transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {savingReschedule ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Actual Printable Bill (Hidden on screen, visible only on print) */}
    {billAppointment && (
      <div className="hidden print:block w-full bg-white text-black p-4">
        <BillContent appointment={billAppointment} />
      </div>
    )}
    </>
  );
}

