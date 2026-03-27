import clientPromise from "../mongodb";

export async function updateContent({
  title,
  description
}) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("aboutus");
    const { ObjectId } = await import("mongodb");

    // Store a single about-us document (upsert)
    await collection.updateOne(
      {},
      {
        $set: {
          title: title || "",
          description: description || "",
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    const doc = await collection.findOne({});
    return doc?._id || new ObjectId();
  } catch (error) {
    console.error("Error creating about us content:", error);
    throw error;
  }
}

export async function getContent() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("aboutus");

    const aboutdata = await collection
      .findOne(
        {},
        {
          sort: { createdAt: -1 },
        }
      );

    return aboutdata || {};
  } catch (error) {
    console.error("Error fetching about data:", error);
    throw error;
  }
}


