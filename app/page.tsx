import DoctorsList from "./components/DoctorsList";
import SiteHeader from "./components/SiteHeader";

export default function Home() {

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl font-bold text-slate-800 mb-4">
          Welcome to Raju Hospital
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
          <p>© {new Date().getFullYear()} Raju Hospital. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
