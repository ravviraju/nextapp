import { NextResponse } from "next/server";
import { updateAppointmentStatus, rescheduleAppointment } from "@/lib/models/Appointment";

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, message: "Appointment ID missing" }, { status: 400 });
    }
    const body = await req.json();
    const { action, doctorId, date, time } = body || {};
    if (!action) {
      return NextResponse.json({ success: false, message: "Action is required" }, { status: 400 });
    }
    let success = false;
    if (action === "cancel") {
      success = await updateAppointmentStatus(id, "cancelled");
    } else if (action === "reschedule") {
      if (!doctorId || !date || !time) {
        return NextResponse.json({ success: false, message: "doctorId, date and time required for reschedule" }, { status: 400 });
      }
      success = await rescheduleAppointment(id, doctorId, date, time);
    } else {
      return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
    }
    if (success) {
      return NextResponse.json({ success: true, message: `Appointment ${action}ed successfully` });
    }
    return NextResponse.json({ success: false, message: `Failed to ${action} appointment` }, { status: 500 });
  } catch (error) {
    console.error("[appointments] PUT ERROR:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
