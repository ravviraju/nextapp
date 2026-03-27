import clientPromise from "../mongodb";

export async function createLabInventoryItem({
  testName,
  sampleType,
  batchNumber,
  expiryDate,
  unit,
  quantity,
  unitPrice,
}) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("labInventory");
    const doc = {
      testName: testName || "",
      sampleType: sampleType || "",
      batchNumber: batchNumber || "",
      expiryDate: expiryDate || "",
      unit: unit || "",
      quantity: quantity ?? 0,
      unitPrice: unitPrice ?? 0,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(doc);
    return result.insertedId;
  } catch (error) {
    console.error("Error creating lab inventory item:", error);
    throw error;
  }
}

export async function getAllLabInventoryItems() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("labInventory");

    const items = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return items;
  } catch (error) {
    console.error("Error fetching lab inventory items:", error);
    throw error;
  }
}

export async function updateLabInventoryItem(id, updates) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("labInventory");
    const { ObjectId } = await import("mongodb");

    const _id = new ObjectId(id);

    const set = {
      ...(updates.testName !== undefined ? { testName: updates.testName || "" } : {}),
      ...(updates.sampleType !== undefined ? { sampleType: updates.sampleType || "" } : {}),
      ...(updates.batchNumber !== undefined ? { batchNumber: updates.batchNumber || "" } : {}),
      ...(updates.expiryDate !== undefined ? { expiryDate: updates.expiryDate || "" } : {}),
      ...(updates.unit !== undefined ? { unit: updates.unit || "" } : {}),
      ...(updates.quantity !== undefined ? { quantity: updates.quantity ?? 0 } : {}),
      ...(updates.unitPrice !== undefined ? { unitPrice: updates.unitPrice ?? 0 } : {}),
    };

    const result = await collection.updateOne({ _id }, { $set: set });
    const item = await collection.findOne({ _id });

    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      item,
    };
  } catch (error) {
    console.error("Error updating lab inventory item:", error);
    throw error;
  }
}

export async function deleteLabInventoryItem(id) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("labInventory");
    const { ObjectId } = await import("mongodb");

    const _id = new ObjectId(id);
    const result = await collection.deleteOne({ _id });
    return { deletedCount: result.deletedCount };
  } catch (error) {
    console.error("Error deleting lab inventory item:", error);
    throw error;
  }
}

