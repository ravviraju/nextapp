"use client";

import { useEffect, useState } from "react";

export default function DoctorsList() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/doctors")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDoctors(data.doctors || []);
      })
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden h-64 animate-pulse"
          >
            <div className="h-48 bg-slate-200" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 text-center border border-slate-200 shadow-sm">
        <p className="text-slate-500">
          No doctors listed yet. Check back soon or contact admin.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {doctors.map((doctor) => (
        <div
          key={doctor._id}
          className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition"
        >
          <div className="h-48 bg-slate-100 flex items-center justify-center overflow-hidden">
            {doctor.imageUrl ? (
              <img
                src={doctor.imageUrl}
                alt={doctor.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-sky-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-sky-600">
                  {doctor.name?.charAt(0) || "?"}
                </span>
              </div>
            )}
          </div>
          <div className="p-4">
            <h4 className="font-semibold text-slate-800">{doctor.name}</h4>
            <p className="text-sm text-sky-600 font-medium">
              {doctor.specialization?.name || "General"}
            </p>
            {doctor.qualification && (
              <p className="text-sm text-slate-500 mt-1">
                {doctor.qualification}
              </p>
            )}
            {doctor.experienceYears != null && (
              <p className="text-xs text-slate-400 mt-1">
                {doctor.experienceYears} years experience
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
