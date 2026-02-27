import { NextResponse } from "next/server";
import {
  createSpecialization,
  getAllSpecializations,
} from "@/lib/models/Specialization";

export async function GET() {
  try {
    const specs = await getAllSpecializations();
    return NextResponse.json({ success: true, specializations: specs });
  } catch (error) {
    console.error("[specializations] GET ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch specializations" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, description } = body || {};

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 }
      );
    }

    const id = await createSpecialization({ name, description });

    return NextResponse.json({
      success: true,
      message: "Specialization created",
      id: id.toString(),
    });
  } catch (error) {
    console.error("[specializations] POST ERROR:", error);

    if (error.message === "Specialization already exists") {
      return NextResponse.json(
        { success: false, message: "Specialization already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to create specialization" },
      { status: 500 }
    );
  }
}

