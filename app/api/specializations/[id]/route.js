import { NextResponse } from "next/server";
import { updateSpecialization } from "@/lib/models/Specialization";

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { name, description } = body || {};

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 }
      );
    }

    await updateSpecialization(id, { name, description });

    return NextResponse.json({
      success: true,
      message: "Specialization updated",
    });
  } catch (error) {
    console.error("[specializations/:id] PUT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update specialization" },
      { status: 500 }
    );
  }
}

