import clientPromise from "../mongodb";

export async function createAppointment({
  doctorId,
  date,
  time,
  patientName,
  patientPhone,
  notes,
  userId,
}) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("appointments");
    const { ObjectId } = await import("mongodb");

    const doc = {
      doctorId: new ObjectId(doctorId),
      date,
      time,
      patientName: patientName || "",
      patientPhone: patientPhone || "",
      notes: notes || "",
      status: "scheduled",
      createdAt: new Date(),
      ...(userId && { userId: new ObjectId(userId) }),
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

export async function getAppointmentsForUser(userId) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("appointments");
    const { ObjectId } = await import("mongodb");

    const _userId = new ObjectId(userId);

    const appointments = await collection
      .aggregate([
        {
          $match: {
            userId: _userId,
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
    console.error("Error fetching user appointments:", error);
    throw error;
  }
}


