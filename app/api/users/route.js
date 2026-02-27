import { NextResponse } from "next/server";
import { getAllUsers } from "@/lib/models/User";

export async function GET() {
  try {
    const users = await getAllUsers();

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("[users] ERROR:", {
      message: error?.message,
      name: error?.name,
    });

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
      },
      { status: 500 }
    );
  }
}

