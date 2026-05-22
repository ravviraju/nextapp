import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    const patients = await db.collection("appointments").aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "doctorId",
          foreignField: "_id",
          as: "doctor",
        },
      },
      {
        $unwind: {
          path: "$doctor",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          name: {
            $cond: [
              { $and: ["$user", "$user.name"] },
              "$user.name",
              "$patientName",
            ],
          },
          phone: {
            $cond: [
              { $and: ["$user", "$user.phone"] },
              "$user.phone",
              "$patientPhone",
            ],
          },
          email: {
            $cond: [{ $and: ["$user", "$user.email"] }, "$user.email", ""],
          },
          date: 1,
          time: 1,
          status: 1,
          doctorName: "$doctor.name",
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $and: [{ $ne: ["$phone", null] }, { $ne: ["$phone", ""] }] },
              { $toLower: "$phone" },
              { $toLower: { $ifNull: ["$name", "Unknown"] } }
            ]
          },
          name: { $first: "$name" },
          email: { $first: "$email" },
          phone: { $first: "$phone" },
          appointmentCount: { $sum: 1 },
          lastAppointmentDate: { $max: "$date" },
          appointments: {
            $push: {
              date: "$date",
              time: "$time",
              status: "$status",
              doctorName: "$doctorName"
            }
          }
        },
      },
      {
        $sort: { lastAppointmentDate: -1 },
      },
    ]).toArray();

    return NextResponse.json({ success: true, patients });
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch patients" },
      { status: 500 }
    );
  }
}
