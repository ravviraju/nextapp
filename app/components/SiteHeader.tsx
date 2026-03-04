"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type MeResponse =
  | { success: true; user: { id: string; email: string; name: string } }
  | { success: false; message: string };

export default function SiteHeader() {
  const router = useRouter();
  const [user, setUser] = useState<MeResponse["user"] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        if (!res.ok) {
          if (!cancelled) setUser(null);
          return;
        }
        const data: MeResponse = await res.json();
        if ("success" in data && data.success && !cancelled) {
          setUser(data.user);
        } else if (!cancelled) {
          setUser(null);
        }
      } catch {
        if (!cancelled) setUser(null);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      setUser(null);
      router.push("/login");
    }
  };

  return (
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
            <h1 className="text-xl font-bold text-slate-800">Raju Hospital</h1>
            <p className="text-xs text-slate-500">Doctors &amp; Specialists</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/appointments"
            className="text-sm font-medium text-sky-600 hover:text-sky-700 px-3 py-2 rounded-lg hover:bg-sky-50 transition"
          >
            My Appointments
          </Link>
          {user ? (
            <>
              <span className="hidden sm:inline text-xs text-slate-500">
                {user.name || user.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg px-3 py-1 hover:bg-slate-100 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-sky-600 hover:text-sky-700 px-3 py-2 rounded-lg hover:bg-sky-50 transition"
              >
                Patient Login
              </Link>
              <Link
                href="/register"
                className="text-xs font-medium text-sky-600 hover:text-sky-700 px-3 py-2 rounded-lg hover:bg-sky-50 transition"
              >
                Register
              </Link>
            </>
          )}
          <Link
            href="/admin/login"
            className="text-xs font-medium text-slate-500 hover:text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-100 transition border border-slate-200"
          >
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}

