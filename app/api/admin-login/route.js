import { NextResponse } from "next/server";
import { findUserByEmail, verifyPassword } from "@/lib/models/User";

export async function POST(req) {
  try {

    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    console.log("[admin-login] Body parsed", { email });

    // Find user in database
    const user = await findUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Access denied. Admin role required." },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Login successful
    console.log("[admin-login] Login successful", { email: user.email, role: user.role });
    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[admin-login] ERROR:", {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
    });
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        ...(process.env.NODE_ENV !== "production" && {
          debug: error?.message || "Unknown error",
        }),
      },
      { status: 500 }
    );
  }
}
