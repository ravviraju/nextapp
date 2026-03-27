"use client";

import { useEffect, useState } from "react";

export default function AboutPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    const res = await fetch("/api/aboutus");
    const data = await res.json();

    if (data.data) {
      setTitle(data.data.title);
      setDescription(data.data.description);
    }
  };

  const updateAbout = async () => {
    const res = await fetch("/api/aboutus", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, description }),
    });

    const data = await res.json();

    if (data.success) {
      alert("About Us updated successfully");
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
          About Us Content
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows="7"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex gap-3 flex-col sm:flex-row">
            <button
              onClick={updateAbout}
              className="bg-blue-600 text-white py-3 px-5 rounded-lg hover:bg-blue-700 transition"
            >
              Update Content
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}