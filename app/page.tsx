import Image from "next/image";
import Link from "next/link";
import DoctorsList from "./components/DoctorsList";

export default function Home() {

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/hospital-logo.svg"
              alt="Hospital Logo"
              width={48}
              height={48}
              className="rounded-lg"
            />
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                CareWell Hospital
              </h1>
              <p className="text-xs text-slate-500">
                Doctors &amp; Specialists
              </p>
            </div>
          </Link>
          <Link
            href="/admin/login"
            className="text-sm font-medium text-sky-600 hover:text-sky-700 px-4 py-2 rounded-lg hover:bg-sky-50 transition"
          >
            Admin Login
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl font-bold text-slate-800 mb-4">
          Welcome to CareWell Hospital
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
          Your trusted healthcare partner. We bring together experienced
          doctors and specialists to provide the best care for you and your
          family.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <div className="bg-white rounded-xl px-6 py-4 shadow-sm border border-slate-100 min-w-[140px]">
            <div className="text-2xl font-bold text-sky-600">Expert</div>
            <div className="text-sm text-slate-500">Our Doctors</div>
          </div>
          <div className="bg-white rounded-xl px-6 py-4 shadow-sm border border-slate-100 min-w-[140px]">
            <div className="text-2xl font-bold text-sky-600">24/7</div>
            <div className="text-sm text-slate-500">Care Available</div>
          </div>
        </div>
      </section>

      {/* Our Doctors */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <h3 className="text-2xl font-bold text-slate-800 mb-6">
          Our Doctors
        </h3>
        <DoctorsList />
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-300 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm">
          <p>© {new Date().getFullYear()} CareWell Hospital. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
