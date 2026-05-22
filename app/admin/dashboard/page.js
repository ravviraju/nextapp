"use client";

import { useEffect, useState } from "react";
import Head from "next/head";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (fromDate) queryParams.append("fromDate", fromDate);
      if (toDate) queryParams.append("toDate", toDate);
      
      const queryString = queryParams.toString();
      const res = await fetch(`/api/admin-dashboard-stats${queryString ? `?${queryString}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-xl font-medium text-gray-500 animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-xl font-medium text-red-500 bg-red-50 p-6 rounded-lg shadow-sm border border-red-100">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard | Revenue Analytics</title>
        <meta name="description" content="Overview of appointments, labs, tests and total revenue" />
      </Head>
      
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-4">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-gray-100 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-2">Overview of financial and operational metrics</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 px-2">
              <span className="text-sm font-medium text-gray-500">From</span>
              <input 
                type="date" 
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="text-sm border-none bg-gray-50 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 outline-none text-gray-700"
              />
            </div>
            <div className="hidden sm:block w-px h-6 bg-gray-200"></div>
            <div className="flex items-center gap-2 px-2">
              <span className="text-sm font-medium text-gray-500">To</span>
              <input 
                type="date" 
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="text-sm border-none bg-gray-50 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 outline-none text-gray-700"
              />
            </div>
            <button 
              onClick={fetchStats}
              className="ml-2 bg-emerald-600 text-white px-4 py-1.5 rounded-xl text-sm font-semibold shadow-sm hover:bg-emerald-700 hover:shadow transition-all"
            >
              Filter
            </button>
          </div>
        </header>
        
        {/* Top Summary Section */}
        <div className="relative bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl p-8 sm:p-10 shadow-xl overflow-hidden text-white border border-emerald-900/20">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-5 blur-3xl"></div>
          <div className="absolute bottom-0 right-10 w-40 h-40 rounded-full bg-emerald-400 opacity-10 blur-2xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <svg xmlns="http://www.w3.org/-2000/svg" className="h-6 w-6 text-emerald-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-sm sm:text-base font-semibold text-emerald-100 uppercase tracking-widest">
                  Total System Revenue
                </h2>
              </div>
              <p className="text-5xl sm:text-6xl font-black tracking-tight drop-shadow-sm">
                <span className="text-emerald-300/80 mr-1">₹</span>
                {stats?.totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </p>
            </div>
            
            <div className="hidden md:block text-right">
              <div className="inline-flex items-center justify-center p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner">
                <div className="text-center">
                  <p className="text-xs text-emerald-200 uppercase tracking-wider mb-1">Status</p>
                  <p className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live Syncing
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Breakdown Section */}
        <div className="pt-4">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            Revenue Breakdown
            <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">By Category</span>
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Appointments Revenue */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <svg className="w-24 h-24 text-blue-600 transform translate-x-4 -translate-y-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              </div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                    <svg xmlns="http://www.w3.org/-2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider group-hover:text-blue-600 transition-colors">Consultations</h2>
                </div>
                <div className="mt-auto">
                  <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    <span className="text-gray-400 font-medium text-xl mr-1">₹</span>
                    {stats?.appointmentsRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </p>
                </div>
              </div>
            </div>

            {/* Lab Revenue */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg hover:border-purple-300 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <svg className="w-24 h-24 text-purple-600 transform translate-x-4 -translate-y-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
              </div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm">
                    <svg xmlns="http://www.w3.org/-2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider group-hover:text-purple-600 transition-colors">Laboratory</h2>
                </div>
                <div className="mt-auto">
                  <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    <span className="text-gray-400 font-medium text-xl mr-1">₹</span>
                    {stats?.labRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </p>
                </div>
              </div>
            </div>

            {/* Pharma Revenue */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg hover:border-pink-300 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <svg className="w-24 h-24 text-pink-600 transform translate-x-4 -translate-y-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
              </div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-pink-600 group-hover:text-white transition-all shadow-sm">
                    <svg xmlns="http://www.w3.org/-2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider group-hover:text-pink-600 transition-colors">Pharmacy</h2>
                </div>
                <div className="mt-auto">
                  <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    <span className="text-gray-400 font-medium text-xl mr-1">₹</span>
                    {stats?.pharmaRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </p>
                </div>
              </div>
            </div>

            {/* In-Patient Revenue */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <svg className="w-24 h-24 text-indigo-600 transform translate-x-4 -translate-y-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
              </div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                    <svg xmlns="http://www.w3.org/-2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider group-hover:text-indigo-600 transition-colors">In-Patient</h2>
                </div>
                <div className="mt-auto">
                  <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    <span className="text-gray-400 font-medium text-xl mr-1">₹</span>
                    {stats?.ipRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
