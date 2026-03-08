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

    const doc = {
      title: title || "",
      description: description || "",
      createdAt: new Date()
    };

    const result = await collection.insertOne(doc);
    return result.insertedId;
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
      .aggregate([
        {
          $sort: {
            date: 1,
            time: 1,
            createdAt: -1,
          },
        },
      ])
      .toArray();

    return aboutdata;
  } catch (error) {
    console.error("Error fetching about data:", error);
    throw error;
  }
}


