import { NextResponse } from "next/server";
import { updateDoctor, deleteDoctor } from "@/lib/models/Doctor";

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();

    await updateDoctor(id, body || {});

    return NextResponse.json({
      success: true,
      message: "Doctor updated",
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

