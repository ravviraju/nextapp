"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  // Do not show admin shell on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

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
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
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
      <main className="flex-1 p-6">{children}</main>
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

