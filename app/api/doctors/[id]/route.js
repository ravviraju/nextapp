import { NextResponse } from "next/server";
import { updateDoctor, deleteDoctor } from "@/lib/models/Doctor";

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();

    const result = await updateDoctor(id, body || {});

    alert(JSON.stringify(result));

    if (!result?.matchedCount) {
      return NextResponse.json(
        { success: false, message: "Doctor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Doctor updated",
      modifiedCount: result.modifiedCount,
      doctor: result.doctor,
    });
  } catch (error) {
    console.error("[doctors/:id] PUT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update doctor" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    await deleteDoctor(id);

    return NextResponse.json({
      success: true,
      message: "Doctor deleted",
    });
  } catch (error) {
    console.error("[doctors/:id] DELETE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete doctor" },
      { status: 500 }
    );
  }
}

