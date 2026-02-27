import Link from "next/link";
import Image from "next/image";

export default function AdminLayout({ children }) {
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

function NavItem({ href, label }) {
  return (
    <Link
      href={href}
      className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
    >
      <span>{label}</span>
    </Link>
  );
}

