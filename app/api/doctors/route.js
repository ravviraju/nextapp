import { NextResponse } from "next/server";
import { createDoctor, getAllDoctors } from "@/lib/models/Doctor";

export async function GET() {
  try {
    const doctors = await getAllDoctors();
    return NextResponse.json({ success: true, doctors });
  } catch (error) {
    console.error("[doctors] GET ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch doctors" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      name,
      specializationId,
      qualification,
      experienceYears,
      contactEmail,
      contactPhone,
      notes,
    } = body || {};

    if (!name || !specializationId) {
      return NextResponse.json(
        { success: false, message: "Name and specialization are required" },
        { status: 400 }
      );
    }

    const parsedExperience =
      typeof experienceYears === "string"
        ? parseInt(experienceYears, 10)
        : experienceYears;

    const id = await createDoctor({
      name,
      specializationId,
      qualification,
      experienceYears:
        Number.isNaN(parsedExperience) || parsedExperience == null
          ? null
          : parsedExperience,
      contactEmail,
      contactPhone,
      notes,
    });

    return NextResponse.json({
      success: true,
      message: "Doctor created",
      id: id.toString(),
    });
  } catch (error) {
    console.error("[doctors] POST ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create doctor" },
      { status: 500 }
    );
  }
}

