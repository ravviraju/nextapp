import { NextResponse } from "next/server";
import {
  createAppointment,
  getAllAppointments,
} from "@/lib/models/Appointment";

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

export async function GET() {
  try {
    const appointments = await getAllAppointments();
    return NextResponse.json({ success: true, appointments });
  } catch (error) {
    console.error("[appointments] GET ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { doctorId, date, time, patientName, patientPhone, notes } =
      body || {};

    if (!doctorId || !date || !time) {
      return NextResponse.json(
        {
          success: false,
          message: "doctorId, date and time are required",
        },
        { status: 400 }
      );
    }

    const cookieHeader = req.headers.get("cookie") || "";
    const parsed = parseCookies(cookieHeader);
    const userSession = parsed["user_session"];
    const adminSession = parsed["admin_session"];

    // Require either a logged-in user (website) or admin (admin panel)
    if (!userSession && !adminSession) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const userId = userSession || undefined;

    const id = await createAppointment({
      doctorId,
      date,
      time,
      patientName,
      patientPhone,
      notes,
      userId,
    });

    return NextResponse.json({
      success: true,
      message: "Appointment created",
      id: id.toString(),
    });
  } catch (error) {
    console.error("[appointments] POST ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create appointment" },
      { status: 500 }
    );
  }
}

