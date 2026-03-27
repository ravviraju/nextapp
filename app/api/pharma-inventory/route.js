import { NextResponse } from "next/server";
import {
  createInventoryItem,
  getAllInventoryItems,
} from "@/lib/models/PharmaInventory";

export async function GET() {
  try {
    const items = await getAllInventoryItems();
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("[pharma-inventory] GET ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, batchNumber, expiryDate, unit, quantity, unitPrice } =
      body || {};

    if (!name || !batchNumber) {
      return NextResponse.json(
        { success: false, message: "name and batchNumber are required" },
        { status: 400 }
      );
    }

    const id = await createInventoryItem({
      name,
      batchNumber,
      expiryDate,
      unit,
      quantity: Number(quantity ?? 0),
      unitPrice: Number(unitPrice ?? 0),
    });

    return NextResponse.json({
      success: true,
      message: "Inventory item created",
      id: id.toString(),
    });
  } catch (error) {
    console.error("[pharma-inventory] POST ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create inventory item" },
      { status: 500 }
    );
  }
}

