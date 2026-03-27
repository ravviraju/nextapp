import { NextResponse } from "next/server";
import {
  updateLabInventoryItem,
  deleteLabInventoryItem,
} from "@/lib/models/LabInventory";

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();

    const result = await updateLabInventoryItem(id, body || {});
    if (!result?.matchedCount) {
      return NextResponse.json(
        { success: false, message: "Inventory item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Inventory item updated",
      modifiedCount: result.modifiedCount,
      item: result.item,
    });
  } catch (error) {
    console.error("[lab-inventory/:id] PUT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update inventory item" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const result = await deleteLabInventoryItem(id);

    if (!result?.deletedCount) {
      return NextResponse.json(
        { success: false, message: "Inventory item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Inventory item deleted",
    });
  } catch (error) {
    console.error("[lab-inventory/:id] DELETE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete inventory item" },
      { status: 500 }
    );
  }
}

