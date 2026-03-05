import { NextResponse } from "next/server";
import { findUserById } from "@/lib/models/User";

function parseCookies(header) {
  const result = {};
  if (!header) return result;
  const pairs = header.split(";");
  for (const pair of pairs) {
    const [key, ...rest] = pair.split("=");
    if (!key) continue;
    const name = key.trim();
    const value = rest.join("=").trim();
    if (!name) continue;
    result[name] = decodeURIComponent(value || "");
  }
  return result;
}

export async function GET(req) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const parsed = parseCookies(cookieHeader);
    const session = parsed["user_session"];

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    let user;
    try {
      user = await findUserById(session);
    } catch {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name || "",
      },
    });
  } catch (error) {
    console.error("[me] ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

