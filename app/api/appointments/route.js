import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createAppointment,
  getAllAppointments,
} from "@/lib/models/Appointment";

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

    const store = cookies();
    const userSession = store.get("user_session");
    const adminSession = store.get("admin_session");

    // Require either a logged-in user (website) or admin (admin panel)
    if (!userSession?.value && !adminSession?.value) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const userId = userSession?.value;

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

