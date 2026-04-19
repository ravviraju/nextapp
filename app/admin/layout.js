"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Do not show admin shell on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Close sidebar on path change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin-logout", { method: "POST" });
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      router.push("/admin/login");
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-900 font-sans text-slate-100 selection:bg-indigo-500/30">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8 bg-indigo-600 rounded-lg p-1">
              <Image src="/window.svg" alt="Logo" fill className="object-contain filter invert" sizes="32px" />
            </div>
            <div className="text-sm font-bold tracking-wider text-white uppercase">
              Hospital Admin
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 transition"
          >
            Menu
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static z-50 md:z-auto inset-y-0 left-0 w-72 md:w-64 bg-slate-900 flex flex-col transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center gap-4 px-6 py-8">
          <div className="relative h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20 p-2 flex-shrink-0">
            <Image src="/window.svg" alt="Admin Badge" fill className="object-contain filter invert opacity-90 p-1.5" sizes="40px" priority />
          </div>
          <div>
            <div className="text-sm font-black text-white uppercase tracking-widest">
              Hospital Desk
            </div>
            <div className="text-[10px] text-indigo-300 uppercase tracking-widest font-semibold mt-0.5">
              Secure Operations
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-4 px-2">Primary</div>
          <NavItem href="/admin/dashboard" label="Dashboard" currentPath={pathname} />
          <NavItem href="/admin/live-queue" label="Live Token Queue" currentPath={pathname} />
          
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6 px-2">Staff</div>
          <NavItem href="/admin/doctors" label="Doctors" currentPath={pathname} />
          <NavItem href="/admin/specializations" label="Specializations" currentPath={pathname} />
          <NavItem href="/admin/users" label="System Users" currentPath={pathname} />

          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6 px-2">Patient Hub</div>
          <NavItem href="/admin/patients" label="Outpatient Directory" currentPath={pathname} />
          <NavItem href="/admin/appointments" label="Appointments History" currentPath={pathname} />
          <NavItem href="/admin/beds" label="Beds Management" currentPath={pathname} />
          <NavItem href="/admin/inpatients" label="In-Patient Workflow" currentPath={pathname} />

          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6 px-2">Diagnostics & Stock</div>
          <NavItem href="/admin/lab-inventory" label="Lab Inventory" currentPath={pathname} />
          <NavItem href="/admin/lab-bills" label="Lab Billing" currentPath={pathname} />
          <NavItem href="/admin/pharma-inventory" label="Pharmacy Inventory" currentPath={pathname} />
          <NavItem href="/admin/pharma-bills" label="Pharmacy Billing" currentPath={pathname} />

          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6 px-2">Tools</div>
          <NavItem href="/admin/aboutus" label="Website Identity" currentPath={pathname} />
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-slate-800/50 rounded-2xl p-2 border border-slate-700/50">
             <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all duration-300 text-sm font-medium"
              >
                Sign Out Sessions
              </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area Container */}
      <main className="flex-1 md:py-2 md:pr-2 flex flex-col min-w-0 transition-all">
         {/* Standard app-like inner window */}
        <div className="flex-1 bg-slate-50 text-slate-900 md:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200/50 overflow-hidden flex flex-col relative pt-16 md:pt-0">
          <div className="flex-1 overflow-x-hidden overflow-y-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ href, label, currentPath }) {
  const isActive = currentPath === href || (href !== "/admin/dashboard" && currentPath?.startsWith(href));

  return (
    <Link
      href={href}
      className={`group relative flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden ${
        isActive
          ? "text-white bg-indigo-500/10"
          : "text-slate-400 hover:text-slate-100 border border-transparent hover:bg-slate-800/80"
      }`}
    >
      {/* Active Indicator Bar */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2/3 w-1 bg-gradient-to-b from-indigo-400 to-purple-600 rounded-r-lg shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
      )}
      
      {/* Active Subtle Background Glow */}
      {isActive && (
        <div className="absolute inset-0 bg-indigo-500/5 blur-xl block" />
      )}

      <span className="relative z-10 block truncate pl-2">{label}</span>
      
      {isActive && (
         <svg className="ml-auto w-4 h-4 text-indigo-400 relative z-10 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
         </svg>
      )}
    </Link>
  );
}
