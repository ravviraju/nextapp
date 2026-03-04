import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findUserById } from "@/lib/models/User";

export async function GET() {
  try {
    const store = cookies();
    const session = store.get("user_session");

    if (!session?.value) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const user = await findUserById(session.value);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name || "",
      },
    });
  } catch (error) {
    console.error("[me] ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

