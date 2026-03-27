import { NextResponse } from "next/server";
import { createLabBill, getAllLabBills } from "@/lib/models/LabBill";

export async function GET() {
  try {
    const bills = await getAllLabBills();
    return NextResponse.json({ success: true, bills });
  } catch (error) {
    console.error("[lab-bills] GET ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch lab bills" },
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

    const result = await createLabBill({
      patientName,
      patientPhone,
      patientAge,
      patientGender,
      patientAddress,
      items,
    });

    return NextResponse.json({
      success: true,
      message: "Lab bill created",
      billId: result.id.toString(),
      total: result.total,
    });
  } catch (error) {
    console.error("[lab-bills] POST ERROR:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to create bill" },
      { status: 400 }
    );
  }
}

