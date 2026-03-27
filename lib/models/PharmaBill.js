import clientPromise from "../mongodb";

export async function getAllPharmaBills() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("pharmaBills");

    const bills = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return bills;
  } catch (error) {
    console.error("Error fetching pharma bills:", error);
    throw error;
  }
}

export async function createPharmaBill({
  patientName,
  patientPhone,
  patientAge,
  patientGender,
  patientAddress,
  items,
}) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("pharmaBills");
    const inventoryCollection = db.collection("pharmaInventory");
    const { ObjectId } = await import("mongodb");

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Items are required");
    }

    // Validate inventory and compute totals
    const resolvedItems = [];
    let subtotal = 0;

    for (const it of items) {
      const inventoryId = it.inventoryId;
      const qty = Number(it.quantity ?? 0);
      const unitPrice = Number(it.unitPrice ?? 0);

      if (!inventoryId) throw new Error("inventoryId is required");
      if (!Number.isFinite(qty) || qty <= 0) {
        throw new Error("quantity must be greater than 0");
      }

      const inv = await inventoryCollection.findOne({
        _id: new ObjectId(inventoryId),
      });

      if (!inv) {
        throw new Error(`Inventory item not found: ${inventoryId}`);
      }

      if (inv.quantity < qty) {
        throw new Error(`Insufficient stock for ${inv.name} (available: ${inv.quantity})`);
      }

      const effectiveUnitPrice = unitPrice || inv.unitPrice || 0;
      const lineTotal = qty * effectiveUnitPrice;
      subtotal += lineTotal;

      resolvedItems.push({
        inventoryId: new ObjectId(inventoryId),
        name: inv.name,
        batchNumber: inv.batchNumber,
        quantity: qty,
        unit: inv.unit,
        unitPrice: effectiveUnitPrice,
        lineTotal,
      });
    }

    const total = subtotal;

    // Decrement inventory after validation
    for (const r of resolvedItems) {
      await inventoryCollection.updateOne(
        {
          _id: r.inventoryId,
          quantity: { $gte: r.quantity },
        },
        { $inc: { quantity: -r.quantity } }
      );
    }

    const doc = {
      patientName: patientName || "",
      patientPhone: patientPhone || "",
      patientAge: patientAge ?? null,
      patientGender: patientGender || "",
      patientAddress: patientAddress || "",
      items: resolvedItems,
      subtotal,
      total,
      status: "paid",
      createdAt: new Date(),
    };

    const result = await collection.insertOne(doc);
    return {
      id: result.insertedId,
      total,
    };
  } catch (error) {
    console.error("Error creating pharma bill:", error);
    throw error;
  }
}

