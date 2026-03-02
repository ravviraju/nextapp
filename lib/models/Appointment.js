import clientPromise from "../mongodb";

export async function createAppointment({
  doctorId,
  date,
  time,
  patientName,
  patientPhone,
  notes,
}) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("appointments");
    const { ObjectId } = await import("mongodb");

    const doc = {
      doctorId: new ObjectId(doctorId),
      date, // store as ISO date string (e.g. 2026-03-02)
      time, // store as HH:mm string
      patientName: patientName || "",
      patientPhone: patientPhone || "",
      notes: notes || "",
      status: "scheduled",
      createdAt: new Date(),
    };

    const result = await collection.insertOne(doc);
    return result.insertedId;
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw error;
  }
}

export async function getAllAppointments() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("appointments");

    const appointments = await collection
      .aggregate([
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
          $lookup: {
            from: "specializations",
            localField: "doctor.specializationId",
            foreignField: "_id",
            as: "specialization",
          },
        },
        {
          $unwind: {
            path: "$specialization",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $sort: {
            date: 1,
            time: 1,
            createdAt: -1,
          },
        },
      ])
      .toArray();

    return appointments;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
}

