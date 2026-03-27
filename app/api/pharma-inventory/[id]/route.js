import { NextResponse } from "next/server";
import {
  updateInventoryItem,
  deleteInventoryItem,
} from "@/lib/models/PharmaInventory";

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();

    const result = await updateInventoryItem(id, body || {});
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
    console.error("[pharma-inventory/:id] PUT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update inventory item" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const result = await deleteInventoryItem(id);

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
    console.error("[pharma-inventory/:id] DELETE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete inventory item" },
      { status: 500 }
    );
  }
}

