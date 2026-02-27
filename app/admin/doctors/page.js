"use client";

import { useEffect, useState } from "react";

export default function AdminDoctorsPage() {
  const [specializations, setSpecializations] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [name, setName] = useState("");
  const [specializationId, setSpecializationId] = useState("");
  const [qualification, setQualification] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchSpecializations = async () => {
    try {
      const res = await fetch("/api/specializations");
      const data = await res.json();
      if (data.success) {
        setSpecializations(data.specializations || []);
      } else {
        alert(data.message || "Failed to load specializations");
      }
    } catch (err) {
      console.error("Error fetching specializations", err);
      alert("Error fetching specializations");
    }
  };

  const fetchDoctors = async () => {
    try {
      setLoadingList(true);
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
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchSpecializations();
    fetchDoctors();
  }, []);

  const resetForm = () => {
    setEditId(null);
    setName("");
    setSpecializationId("");
    setQualification("");
    setExperienceYears("");
    setContactEmail("");
    setContactPhone("");
    setNotes("");
  };

  const handleSubmit = async () => {
    if (!name || !specializationId) {
      alert("Name and specialization are required");
      return;
    }

    try {
      setLoadingSave(true);
      const payload = {
        name,
        specializationId,
        qualification,
        experienceYears,
        contactEmail,
        contactPhone,
        notes,
      };

      let res;
      if (editId) {
        res = await fetch(`/api/doctors/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/doctors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.success) {
        alert(editId ? "Doctor updated" : "Doctor created");
        resetForm();
        fetchDoctors();
      } else {
        alert(data.message || "Failed to save doctor");
      }
    } catch (err) {
      console.error("Error saving doctor", err);
      alert("Error saving doctor");
    } finally {
      setLoadingSave(false);
    }
  };

  const handleEditClick = (doctor) => {
    setEditId(doctor._id);
    setName(doctor.name || "");
    setSpecializationId(
      doctor.specializationId || doctor.specialization?._id || ""
    );
    setQualification(doctor.qualification || "");
    setExperienceYears(
      doctor.experienceYears != null ? String(doctor.experienceYears) : ""
    );
    setContactEmail(doctor.contactEmail || "");
    setContactPhone(doctor.contactPhone || "");
    setNotes(doctor.notes || "");
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this doctor?")) return;

    try {
      const res = await fetch(`/api/doctors/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        alert("Doctor deleted");
        fetchDoctors();
      } else {
        alert(data.message || "Failed to delete doctor");
      }
    } catch (err) {
      console.error("Error deleting doctor", err);
      alert("Error deleting doctor");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">
          {editId ? "Edit Doctor" : "Add Doctor"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Doctor Name"
            className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <select
            className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={specializationId}
            onChange={(e) => setSpecializationId(e.target.value)}
          >
            <option value="">Select specialization</option>
            {specializations.map((spec) => (
              <option key={spec._id} value={spec._id}>
                {spec.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Qualification"
            className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={qualification}
            onChange={(e) => setQualification(e.target.value)}
          />
          <input
            type="number"
            min="0"
            placeholder="Experience (years)"
            className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
          />
          <input
            type="email"
            placeholder="Contact Email"
            className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
          <input
            type="text"
            placeholder="Contact Phone"
            className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
          <textarea
            placeholder="Notes / Additional info"
            className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 md:col-span-2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSubmit}
            disabled={loadingSave}
            className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loadingSave ? "Saving..." : editId ? "Update Doctor" : "Add Doctor"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="w-full max-w-4xl bg-white shadow-lg rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Doctors</h2>
          <button
            onClick={fetchDoctors}
            disabled={loadingList}
            className="text-sm bg-gray-100 px-3 py-2 rounded-md border hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loadingList ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {doctors.length === 0 ? (
          <p className="text-gray-500">No doctors found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border-b text-left">Name</th>
                  <th className="px-4 py-2 border-b text-left">Specialization</th>
                  <th className="px-4 py-2 border-b text-left">Qualification</th>
                  <th className="px-4 py-2 border-b text-left">Experience</th>
                  <th className="px-4 py-2 border-b text-left">Contact</th>
                  <th className="px-4 py-2 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => (
                  <tr key={doctor._id}>
                    <td className="px-4 py-2 border-b">{doctor.name}</td>
                    <td className="px-4 py-2 border-b">
                      {doctor.specialization?.name || "-"}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {doctor.qualification || "-"}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {doctor.experienceYears != null
                        ? `${doctor.experienceYears} yrs`
                        : "-"}
                    </td>
                    <td className="px-4 py-2 border-b">
                      <div className="flex flex-col">
                        {doctor.contactEmail && (
                          <span>{doctor.contactEmail}</span>
                        )}
                        {doctor.contactPhone && (
                          <span>{doctor.contactPhone}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 border-b">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(doctor)}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(doctor._id)}
                          className="text-red-600 hover:underline text-sm"
                        >
                          Delete
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
  );
}

