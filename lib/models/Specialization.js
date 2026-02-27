import clientPromise from "../mongodb";

export async function createSpecialization({ name, description }) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("specializations");

    const existing = await collection.findOne({ name });
    if (existing) {
      throw new Error("Specialization already exists");
    }

    const doc = {
      name,
      description: description || "",
      createdAt: new Date(),
    };

    const result = await collection.insertOne(doc);
    return result.insertedId;
  } catch (error) {
    console.error("Error creating specialization:", error);
    throw error;
  }
}

export async function getAllSpecializations() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("specializations");

    const specs = await collection
      .find({})
      .sort({ name: 1 })
      .toArray();

    return specs;
  } catch (error) {
    console.error("Error fetching specializations:", error);
    throw error;
  }
}

export async function updateSpecialization(id, { name, description }) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("specializations");
    const { ObjectId } = await import("mongodb");

    const _id = new ObjectId(id);

    await collection.updateOne(
      { _id },
      {
        $set: {
          name,
          description: description || "",
        },
      }
    );
  } catch (error) {
    console.error("Error updating specialization:", error);
    throw error;
  }
}

