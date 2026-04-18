import clientPromise from "../mongodb";

export async function getAllBeds() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("beds");

    const beds = await collection.find({}).sort({ wardName: 1, bedNumber: 1 }).toArray();
    return beds;
  } catch (error) {
    console.error("Error fetching beds:", error);
    throw error;
  }
}

export async function createBed({ wardName, bedNumber, dailyRate }) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("beds");

    const doc = {
      wardName: wardName || "",
      bedNumber: bedNumber || "",
      dailyRate: Number(dailyRate) || 0,
      status: "available", // "available" or "occupied"
      createdAt: new Date(),
    };

    const result = await collection.insertOne(doc);
    return result.insertedId;
  } catch (error) {
    console.error("Error creating bed:", error);
    throw error;
  }
}

export async function updateBedStatus(bedId, status) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("beds");
    const { ObjectId } = await import("mongodb");

    await collection.updateOne(
      { _id: new ObjectId(bedId) },
      { $set: { status } }
    );
  } catch (error) {
    console.error("Error updating bed status:", error);
    throw error;
  }
}
