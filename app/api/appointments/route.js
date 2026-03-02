import { NextResponse } from "next/server";
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

    const id = await createAppointment({
      doctorId,
      date,
      time,
      patientName,
      patientPhone,
      notes,
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

