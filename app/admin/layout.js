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

  useEffect(() => {
    // Close sidebar after navigation
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin-logout", {
        method: "POST",
      });
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      router.push("/admin/login");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8">
              <Image
                src="/window.svg"
                alt="Hospital Admin Logo"
                fill
                className="object-contain"
                sizes="32px"
                priority
              />
            </div>
            <div className="text-sm font-semibold text-gray-900">
              Hospital Admin
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
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
          className="md:hidden fixed inset-0 z-40 bg-black/30"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static z-50 md:z-auto inset-y-0 left-0 w-72 md:w-64 bg-white shadow-lg flex flex-col transform transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b">
          <div className="relative h-9 w-9">
            <Image
              src="/window.svg"
              alt="Hospital Admin Logo"
              fill
              className="object-contain"
              sizes="36px"
              priority
            />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">
              Hospital Admin
            </div>
            <div className="text-xs text-gray-500">
              Management Console
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          <NavItem href="/admin/dashboard" label="Dashboard" />
          <NavItem href="/admin/users" label="Users" />
          <NavItem href="/admin/specializations" label="Doctor Specializations" />
          <NavItem href="/admin/doctors" label="Doctors" />
          <NavItem href="/admin/appointments" label="Appointments" />
          <NavItem href="/admin/riskassessment" label="Risk Assessment" />
          <NavItem href="/admin/aboutus" label="About Us" />
          <NavItem href="/admin/pharma-inventory" label="Pharma Inventory" />
          <NavItem href="/admin/pharma-bills" label="Pharma Billing" />
          <NavItem href="/admin/aboutus" label="About Us" />
          <button
            type="button"
            onClick={handleLogout}
            className="w-full text-left flex items-center px-3 py-2 rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-sm"
          >
            Logout
          </button>
        </nav>

        <div className="px-6 py-4 border-t text-xs text-gray-400">
          © {new Date().getFullYear()} Hospital Admin
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 md:ml-0 pt-16 md:pt-6">
        {children}
      </main>
    </div>
  );
}

function NavItem({ href, label, variant }) {
  return (
    <Link
      href={href}
      className={`flex items-center px-3 py-2 rounded-md transition-colors ${
        variant === "danger"
          ? "text-red-600 hover:bg-red-50 hover:text-red-700"
          : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
      }`}
    >
      <span>{label}</span>
    </Link>
  );
}

