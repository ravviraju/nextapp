import clientPromise from "../mongodb";

export async function createInventoryItem({
  name,
  batchNumber,
  expiryDate,
  unit,
  quantity,
  unitPrice,
}) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("pharmaInventory");
    const { ObjectId } = await import("mongodb");

    const doc = {
      name: name || "",
      batchNumber: batchNumber || "",
      expiryDate: expiryDate || "",
      unit: unit || "",
      quantity: quantity ?? 0,
      unitPrice: unitPrice ?? 0,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(doc);
    // keep consistent id type
    return result.insertedId;
  } catch (error) {
    console.error("Error creating pharma inventory item:", error);
    throw error;
  }
}

export async function getAllInventoryItems() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("pharmaInventory");

    const items = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return items;
  } catch (error) {
    console.error("Error fetching pharma inventory items:", error);
    throw error;
  }
}

export async function updateInventoryItem(id, updates) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("pharmaInventory");
    const { ObjectId } = await import("mongodb");

    const _id = new ObjectId(id);

    const set = {
      ...(updates.name !== undefined ? { name: updates.name || "" } : {}),
      ...(updates.batchNumber !== undefined
        ? { batchNumber: updates.batchNumber || "" }
        : {}),
      ...(updates.expiryDate !== undefined
        ? { expiryDate: updates.expiryDate || "" }
        : {}),
      ...(updates.unit !== undefined ? { unit: updates.unit || "" } : {}),
      ...(updates.quantity !== undefined
        ? { quantity: updates.quantity ?? 0 }
        : {}),
      ...(updates.unitPrice !== undefined
        ? { unitPrice: updates.unitPrice ?? 0 }
        : {}),
    };

    const result = await collection.updateOne({ _id }, { $set: set });
    const item = await collection.findOne({ _id });

    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      item,
    };
  } catch (error) {
    console.error("Error updating pharma inventory item:", error);
    throw error;
  }
}

export async function deleteInventoryItem(id) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("pharmaInventory");
    const { ObjectId } = await import("mongodb");

    const _id = new ObjectId(id);
    const result = await collection.deleteOne({ _id });
    return { deletedCount: result.deletedCount };
  } catch (error) {
    console.error("Error deleting pharma inventory item:", error);
    throw error;
  }
}

