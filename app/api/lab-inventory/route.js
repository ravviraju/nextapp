import { NextResponse } from "next/server";
import {
  createLabInventoryItem,
  getAllLabInventoryItems,
} from "@/lib/models/LabInventory";

export async function GET() {
  try {
    const items = await getAllLabInventoryItems();
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("[lab-inventory] GET ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { testName, sampleType, batchNumber, expiryDate, unit, quantity, unitPrice } =
      body || {};

    if (!testName) {
      return NextResponse.json(
        { success: false, message: "testName is required" },
        { status: 400 }
      );
    }

    const id = await createLabInventoryItem({
      testName,
      sampleType,
      batchNumber,
      expiryDate,
      unit,
      quantity: Number(quantity ?? 0),
      unitPrice: Number(unitPrice ?? 0),
    });

    return NextResponse.json({
      success: true,
      message: "Lab inventory item created",
      id: id.toString(),
    });
  } catch (error) {
    console.error("[lab-inventory] POST ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create inventory item" },
      { status: 500 }
    );
  }
}

