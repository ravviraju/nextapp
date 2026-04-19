import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Today in YYYY-MM-DD local format
    // A robust way mapping to whatever timezone the server runs, but usually local ISO works.
    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().slice(0, 10);

    const appointments = await db.collection("appointments").aggregate([
      { $match: { date: localISOTime } },
      {
        $lookup: {
          from: "doctors",
          localField: "doctorId",
          foreignField: "_id",
          as: "doctor",
        },
      },
      { $unwind: { path: "$doctor", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      { $sort: { "doctor.name": 1, time: 1, tokenNumber: 1 } }
    ]).toArray();

    const formattedAppointments = appointments.map(app => {
      // If patientName is empty (e.g. booked via public website), fallback to user's registered name
      if (!app.patientName && app.user) {
        app.patientName = app.user.name || "Web User";
      }
      if (!app.patientPhone && app.user) {
         app.patientPhone = app.user.phone || app.user.email || "Registered Online";
      }
      return app;
    });

    return NextResponse.json(formattedAppointments);
  } catch (error) {
    console.error("Live Queue GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { appointmentId, status } = await req.json();
    const client = await clientPromise;
    const db = client.db();
    const { ObjectId } = await import("mongodb");

    await db.collection("appointments").updateOne(
      { _id: new ObjectId(appointmentId) },
      { $set: { status, updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
