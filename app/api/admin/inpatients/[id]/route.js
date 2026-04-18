import { NextResponse } from "next/server";
import { 
  getAdmissionById, 
  addChargeToAdmission, 
  dischargePatient 
} from "@/lib/models/Inpatient";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const admission = await getAdmissionById(id);
    if (!admission) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(admission);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (body.action === "addCharge") {
      const charge = await addChargeToAdmission(id, body.charge);
      return NextResponse.json({ success: true, charge });
    }
    
    if (body.action === "discharge") {
      await dischargePatient(id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
