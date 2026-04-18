import { NextResponse } from "next/server";
import { getAllBeds, createBed } from "@/lib/models/Bed";

export async function GET() {
  try {
    const beds = await getAllBeds();
    return NextResponse.json(beds);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const bedId = await createBed(body);
    return NextResponse.json({ id: bedId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
