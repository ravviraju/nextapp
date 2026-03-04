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

    // Attach userId if there is a logged-in user (for website bookings)
    let userId;
    try {
      const store = cookies();
      const session = store.get("user_session");
      if (session?.value) {
        userId = session.value;
      }
    } catch {
      // cookies() is only available in a request context; ignore if not
    }

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

