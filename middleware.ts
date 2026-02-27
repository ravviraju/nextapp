import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow admin login page without session
  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  // Protect all other /admin pages
  if (pathname.startsWith("/admin")) {
    const session = req.cookies.get("admin_session")?.value;

    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

