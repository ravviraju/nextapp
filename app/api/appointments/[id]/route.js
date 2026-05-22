import { NextResponse } from "next/server";
import {
  updateAppointmentStatus,
  rescheduleAppointment,
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

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { action, status, doctorId, date, time } = body || {};

    const cookieHeader = req.headers.get("cookie") || "";
    const parsed = parseCookies(cookieHeader);
    const adminSession = parsed["admin_session"];

    if (!adminSession) {
      return NextResponse.json(
        { success: false, message: "Not authenticated as admin" },
        { status: 401 }
      );
    }

    if (action === "cancel") {
      const success = await updateAppointmentStatus(id, "cancelled");
      if (success) {
        return NextResponse.json({ success: true, message: "Appointment cancelled" });
      } else {
        return NextResponse.json(
          { success: false, message: "Failed to cancel appointment or appointment not found" },
          { status: 400 }
        );
      }
    } else if (action === "reschedule") {
      if (!doctorId || !date || !time) {
        return NextResponse.json(
          { success: false, message: "doctorId, date, and time are required to reschedule" },
          { status: 400 }
        );
      }
      
      const success = await rescheduleAppointment(id, doctorId, date, time);
      if (success) {
        return NextResponse.json({ success: true, message: "Appointment rescheduled successfully" });
      } else {
        return NextResponse.json(
          { success: false, message: "Failed to reschedule appointment or appointment not found" },
          { status: 400 }
        );
      }
    } else if (action === "updateStatus") {
        if (!status) {
            return NextResponse.json({ success: false, message: "status is required" }, { status: 400 });
        }
        const success = await updateAppointmentStatus(id, status);
        if (success) {
          return NextResponse.json({ success: true, message: "Appointment status updated" });
        } else {
          return NextResponse.json(
            { success: false, message: "Failed to update appointment status" },
            { status: 400 }
          );
        }
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid action specified" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("[appointments/:id] PUT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while updating the appointment" },
      { status: 500 }
    );
  }
}
