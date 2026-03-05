import { NextResponse } from "next/server";
import { getAppointmentsForUser } from "@/lib/models/Appointment";

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

    let appointments;
    try {
      appointments = await getAppointmentsForUser(session);
    } catch (e) {
      // Most common cause: invalid/old cookie value that isn't a Mongo ObjectId
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, appointments });
  } catch (error) {
    console.error("[my-appointments] GET ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

