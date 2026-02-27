import clientPromise from "../mongodb";

export async function createDoctor({
  name,
  specializationId,
  qualification,
  experienceYears,
  contactEmail,
  contactPhone,
  notes,
}) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("doctors");
    const { ObjectId } = await import("mongodb");

    const doc = {
      name,
      specializationId: new ObjectId(specializationId),
      qualification: qualification || "",
      experienceYears: experienceYears ?? null,
      contactEmail: contactEmail || "",
      contactPhone: contactPhone || "",
      notes: notes || "",
      createdAt: new Date(),
    };

    const result = await collection.insertOne(doc);
    return result.insertedId;
  } catch (error) {
    console.error("Error creating doctor:", error);
    throw error;
  }
}

export async function getAllDoctors() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("doctors");

    const doctors = await collection
      .aggregate([
        {
          $lookup: {
            from: "specializations",
            localField: "specializationId",
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
            createdAt: -1,
          },
        },
      ])
      .toArray();

    return doctors;
  } catch (error) {
    console.error("Error fetching doctors:", error);
    throw error;
  }
}

export async function updateDoctor(id, updates) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("doctors");
    const { ObjectId } = await import("mongodb");

    const _id = new ObjectId(id);

    const set = {
      name: updates.name,
      qualification: updates.qualification || "",
      experienceYears: updates.experienceYears ?? null,
      contactEmail: updates.contactEmail || "",
      contactPhone: updates.contactPhone || "",
      notes: updates.notes || "",
    };

    if (updates.specializationId) {
      set.specializationId = new ObjectId(updates.specializationId);
    }

    await collection.updateOne(
      { _id },
      {
        $set: set,
      }
    );
  } catch (error) {
    console.error("Error updating doctor:", error);
    throw error;
  }
}

export async function deleteDoctor(id) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("doctors");
    const { ObjectId } = await import("mongodb");

    const _id = new ObjectId(id);
    await collection.deleteOne({ _id });
  } catch (error) {
    console.error("Error deleting doctor:", error);
    throw error;
  }
}

