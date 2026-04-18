"use client";

import { useState, useEffect } from "react";
import Head from "next/head";

export default function LiveQueueAdmin() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQueue();
    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
      fetchQueue(false);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const res = await fetch("/api/admin/live-queue");
      if (!res.ok) throw new Error("Failed to load live queue");
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const updateStatus = async (appointmentId, newStatus) => {
    try {
      // Optimistic upate
      setAppointments(prev => prev.map(a => 
        a._id === appointmentId ? { ...a, status: newStatus } : a
      ));
      
      const res = await fetch("/api/admin/live-queue", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, status: newStatus })
      });
      if (!res.ok) throw new Error("Update failed");
    } catch (err) {
      alert("Failed to sync status: " + err.message);
      fetchQueue(false); // Revert
    }
  };

  // Group by doctor
  const groupedTasks = appointments.reduce((acc, curr) => {
    const docName = curr.doctor?.name || "Unassigned";
    if (!acc[docName]) acc[docName] = [];
    acc[docName].push(curr);
    return acc;
  }, {});

  return (
    <>
      <Head>
        <title>Live Daily Queue | Admin</title>
      </Head>
      
      <div className="p-8 h-[calc(100vh-4rem)] md:h-[calc(100vh-1.5rem)] flex flex-col space-y-6 animate-in fade-in">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-indigo-600">
              Live Token System
            </h1>
            <p className="text-gray-500 mt-1">Real-time daily queue tracking for all active doctors</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-4 items-center">
             <span className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               Auto-sync active
             </span>
             <button 
               onClick={() => fetchQueue(true)}
               className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition font-medium"
             >
               Refresh Now
             </button>
          </div>
        </header>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 animate-pulse">Loading Live Queue...</div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg">Error: {error}</div>
        ) : Object.keys(groupedTasks).length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm tracking-wide text-gray-500 border border-gray-100 uppercase font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            No Appointments Scheduled For Today
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto pb-4">
            <div className="flex gap-6 items-start h-full min-w-max">
              {Object.entries(groupedTasks).map(([doctorName, tokens]) => (
                <div key={doctorName} className="w-[350px] flex flex-col h-full bg-slate-50 rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-shrink-0">
                  <div className="bg-slate-800 p-4 border-b border-slate-900 sticky top-0 z-10 text-white shadow-md">
                    <h2 className="font-bold text-lg">{doctorName}</h2>
                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">{tokens.length} Total Tokens</p>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 relative">
                     {tokens.map((token) => {
                       const isCompleted = token.status === 'completed';
                       const isInProgress = token.status === 'in-progress';
                       
                       return (
                         <div key={token._id} className={`p-4 rounded-xl shadow-sm border transition-all duration-300 ${
                           isCompleted ? 'bg-gray-100 border-gray-200 opacity-60' : 
                           isInProgress ? 'bg-indigo-50 border-indigo-200 transform -translate-y-1' : 
                           'bg-white border-gray-200'
                         }`}>
                           <div className="flex justify-between items-start mb-2">
                             <div className={`px-2 py-1 rounded-md text-sm font-black tracking-widest ${
                               isCompleted ? 'bg-gray-200 text-gray-500' :
                               isInProgress ? 'bg-indigo-200 text-indigo-800' :
                               'bg-blue-100 text-blue-800'
                             }`}>
                               TOKEN #{token.tokenNumber || "-"}
                             </div>
                             <div className="text-xs font-bold text-slate-400">{token.time}</div>
                           </div>
                           
                           <h3 className={`font-bold mt-3 ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                             {token.patientName}
                           </h3>
                           <p className="text-xs text-gray-500 mb-4">{token.patientPhone}</p>
                           
                           <div className="mt-2 pt-3 border-t border-gray-100 flex gap-2">
                             <select 
                               value={token.status}
                               onChange={(e) => updateStatus(token._id, e.target.value)}
                               className={`w-full text-xs font-bold uppercase tracking-wider rounded-lg border px-2 py-1.5 focus:ring-2 focus:outline-none transition-colors ${
                                 isCompleted ? 'bg-gray-100 text-gray-500 border-gray-200' :
                                 isInProgress ? 'bg-indigo-500 text-white border-indigo-600 focus:ring-indigo-300' :
                                 'bg-white text-gray-700 border-gray-300 focus:ring-blue-300'
                               }`}
                             >
                               <option value="waiting">Waiting</option>
                               <option value="in-progress">In-Progress</option>
                               <option value="completed">Completed</option>
                               <option value="cancelled">Cancelled</option>
                             </select>
                           </div>
                         </div>
                       )
                     })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
