"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AboutPage() {
  const [about, setAbout] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/aboutus", {
        });
        const data = await res.json();
      
        setAbout(data.data || []);
      } catch (err) {
        console.error("Load aboutus error", err);
        setAbout([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-14">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">About Us</h1>
          <p className="text-sm text-slate-500 mt-1">
            About Us
          </p>
        </div>
      
      </div>

      
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center">
          <p className="text-slate-600 mb-4">
            {about.title}
          </p>
          <p className="text-slate-600 mb-4">
            {about.description}
          </p>
         
        </div>
      
    </div>
  );
}

