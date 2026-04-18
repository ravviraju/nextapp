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
      { $sort: { "doctor.name": 1, tokenNumber: 1, time: 1 } }
    ]).toArray();

    return NextResponse.json(appointments);
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
