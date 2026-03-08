"use client";

import { usePathname } from "next/navigation";
import SiteHeader from "./SiteHeader";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Admin pages have their own layout.
  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-6">{children}</div>
      </main>
      <footer className="bg-slate-800 text-slate-300 py-8 mt-10">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm">
          <p>© {new Date().getFullYear()} Raju Hospital. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

