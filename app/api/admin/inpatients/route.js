import { NextResponse } from "next/server";
import { getAllAdmissions, admitPatient } from "@/lib/models/Inpatient";

export async function GET() {
  try {
    const admissions = await getAllAdmissions();
    return NextResponse.json(admissions);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const admissionId = await admitPatient(body);
    return NextResponse.json({ id: admissionId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
