import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAppointmentsForUser } from "@/lib/models/Appointment";

export async function GET() {
  try {
    const store = cookies();
    const session = store.get("user_session");

    if (!session?.value) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const appointments = await getAppointmentsForUser(session.value);

    return NextResponse.json({ success: true, appointments });
  } catch (error) {
    console.error("[my-appointments] GET ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

