import { NextResponse } from "next/server";
import { createPharmaBill, getAllPharmaBills } from "@/lib/models/PharmaBill";

export async function GET() {
  try {
    const bills = await getAllPharmaBills();
    return NextResponse.json({ success: true, bills });
  } catch (error) {
    console.error("[pharma-bills] GET ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch pharma bills" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      patientName,
      patientPhone,
      patientAge,
      patientGender,
      patientAddress,
      items,
    } = body || {};

    const result = await createPharmaBill({
      patientName,
      patientPhone,
      patientAge,
      patientGender,
      patientAddress,
      items,
    });

    return NextResponse.json({
      success: true,
      message: "Pharma bill created",
      billId: result.id.toString(),
      total: result.total,
    });
  } catch (error) {
    console.error("[pharma-bills] POST ERROR:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to create bill" },
      { status: 400 }
    );
  }
}

