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
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [fee, setFee] = useState("");
  
  const [consultationDuration, setConsultationDuration] = useState("15");
  const [schedule, setSchedule] = useState([
    { day: "Monday", slots: [] },
    { day: "Tuesday", slots: [] },
    { day: "Wednesday", slots: [] },
    { day: "Thursday", slots: [] },
    { day: "Friday", slots: [] },
    { day: "Saturday", slots: [] },
    { day: "Sunday", slots: [] }
  ]);
  const [leaves, setLeaves] = useState([]);

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
    setFee("");
    setSpecializationId("");
    setQualification("");
    setExperienceYears("");
    setContactEmail("");
    setContactPhone("");
    setNotes("");
    setImageUrl("");
    setImageFile(null);
    setConsultationDuration("15");
    setSchedule([
      { day: "Monday", slots: [] },
      { day: "Tuesday", slots: [] },
      { day: "Wednesday", slots: [] },
      { day: "Thursday", slots: [] },
      { day: "Friday", slots: [] },
      { day: "Saturday", slots: [] },
      { day: "Sunday", slots: [] }
    ]);
    setLeaves([]);
  };

  const resizeImage = (file, maxWidth = 300, maxHeight = 300, quality = 0.85) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (JPEG, PNG, etc.)");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be under 2MB");
      return;
    }
    setImageFile(file);
    try {
      const dataUrl = await resizeImage(file);
      setImageUrl(dataUrl);
    } catch (err) {
      console.error("Image resize error", err);
      alert("Failed to process image");
    }
  };

  const handleSubmit = async () => {
    if (!name || !specializationId) {
      alert("Name and specialization are required");
      return;
    }

    // If we have a local data URL image, upload it to Cloudinary first
    let finalImageUrl = imageUrl;
    if (imageUrl && imageUrl.startsWith("data:image/")) {
      try {
        const uploadRes = await fetch("/api/upload-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageData: imageUrl,
            folder: "doctors",
          }),
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.success) {
          console.error("Image upload failed", uploadData);
          alert(uploadData.message || "Failed to upload image");
          return;
        }
        finalImageUrl = uploadData.url;
      } catch (err) {
        console.error("Image upload error", err);
        alert("Failed to upload image");
        return;
      }
    }

    try {
      setLoadingSave(true);
      const payload = {
        name,
        fee,
        specializationId,
        qualification,
        experienceYears,
        contactEmail,
        contactPhone,
        notes,
        imageUrl: finalImageUrl || undefined,
        consultationDuration: parseInt(consultationDuration, 10) || 15,
        schedule: schedule.filter(s => s.slots.length > 0),
        leaves,
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
    setFee(doctor.fee || "");
    const specId =
      doctor.specializationId?.toString?.() ||
      doctor.specialization?._id?.toString?.() ||
      "";
    setSpecializationId(specId);
    setQualification(doctor.qualification || "");
    setExperienceYears(
      doctor.experienceYears != null ? String(doctor.experienceYears) : ""
    );
    setContactEmail(doctor.contactEmail || "");
    setContactPhone(doctor.contactPhone || "");
    setNotes(doctor.notes || "");
    setImageUrl(doctor.imageUrl || "");
    setImageFile(null);
    setConsultationDuration(doctor.consultationDuration ? String(doctor.consultationDuration) : "15");
    
    // Merge existing schedule with defaults to always show all days
    const defaultDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const loadedSchedule = defaultDays.map(day => {
      const existing = (doctor.schedule || []).find(s => s.day === day);
      return existing || { day, slots: [] };
    });
    setSchedule(loadedSchedule);
    setLeaves(doctor.leaves || []);
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
          <div className="md:col-span-2 flex flex-col sm:flex-row items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full border-2 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Doctor"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-sm">No photo</span>
                )}
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Photo
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                JPEG, PNG or WebP. Max 2MB. Will be resized for display.
              </p>
            </div>
          </div>
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
          <input
            type="number"
            placeholder="Consultation Fee"
            className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
          />
          <textarea
            placeholder="Notes / Additional info"
            className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 md:col-span-2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="md:col-span-2 border-t pt-4 mt-2">
            <h3 className="text-lg font-semibold mb-2">Schedule & Availability</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consultation Duration (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  className="border rounded-lg p-2 w-32 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={consultationDuration}
                  onChange={(e) => setConsultationDuration(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weekly Schedule
                </label>
                <div className="space-y-4">
                  {schedule.map((dayItem, dIndex) => (
                    <div key={dayItem.day} className="flex flex-col sm:flex-row sm:items-start gap-2 bg-gray-50 p-3 rounded-lg border">
                      <div className="w-32 font-medium text-gray-800 pt-2">{dayItem.day}</div>
                      <div className="flex-1 space-y-2">
                        {dayItem.slots.map((slot, sIndex) => (
                          <div key={sIndex} className="flex items-center gap-2">
                            <input
                              type="time"
                              className="border rounded p-1 text-sm"
                              value={slot.start}
                              onChange={(e) => {
                                const newSched = [...schedule];
                                newSched[dIndex].slots[sIndex].start = e.target.value;
                                setSchedule(newSched);
                              }}
                            />
                            <span>to</span>
                            <input
                              type="time"
                              className="border rounded p-1 text-sm"
                              value={slot.end}
                              onChange={(e) => {
                                const newSched = [...schedule];
                                newSched[dIndex].slots[sIndex].end = e.target.value;
                                setSchedule(newSched);
                              }}
                            />
                            <button
                              type="button"
                              className="text-red-500 hover:text-red-700 font-bold px-2 py-1"
                              onClick={() => {
                                const newSched = [...schedule];
                                newSched[dIndex].slots.splice(sIndex, 1);
                                setSchedule(newSched);
                              }}
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-1"
                          onClick={() => {
                            const newSched = [...schedule];
                            newSched[dIndex].slots.push({ start: "09:00", end: "17:00" });
                            setSchedule(newSched);
                          }}
                        >
                          + Add Time Slot
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Leaves (Unavailable Dates)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {leaves.map((date, i) => (
                    <div key={i} className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full flex items-center gap-2 text-sm">
                      {date}
                      <button
                        type="button"
                        className="font-bold hover:text-red-900"
                        onClick={() => setLeaves(leaves.filter((_, index) => index !== i))}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="date"
                    id="newLeaveDate"
                    className="border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    type="button"
                    className="bg-gray-200 px-3 py-2 rounded-lg text-sm hover:bg-gray-300"
                    onClick={() => {
                      const input = document.getElementById("newLeaveDate");
                      if (input.value && !leaves.includes(input.value)) {
                        setLeaves([...leaves, input.value]);
                        input.value = "";
                      }
                    }}
                  >
                    Add Leave
                  </button>
                </div>
              </div>
            </div>
          </div>
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
                  <th className="px-4 py-2 border-b text-left w-16">Photo</th>
                  <th className="px-4 py-2 border-b text-left">Name</th>
                  <th className="px-4 py-2 border-b text-left">Fee</th>
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
                    <td className="px-4 py-2 border-b">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {doctor.imageUrl ? (
                          <img
                            src={doctor.imageUrl}
                            alt={doctor.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 border-b">{doctor.name}</td>
                    <td className="px-4 py-2 border-b">{doctor.fee}/-</td>
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

