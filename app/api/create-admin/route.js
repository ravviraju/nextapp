import { NextResponse } from "next/server";
import { createAdminUser } from "@/lib/models/User";

/**
 * API route to create an admin user
 * WARNING: This should be protected or removed in production!
 * For security, consider adding authentication or removing this route after initial setup.
 * 
 * POST /api/create-admin
 * Body: { email: string, password: string }
 */
export async function POST(req) {
  try {
    // TODO: Add authentication check here in production
    // For example, check for a secret token or require admin authentication
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("[create-admin] Invalid JSON body:", parseError);
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { email, password } = body || {};


    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Create admin user
    const userId = await createAdminUser(email, password);

 
    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      userId: userId.toString(),
    });
  } catch (error) {
    console.error("[create-admin] ERROR:", {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
    });
    
    if (error.message === "User already exists") {
      return NextResponse.json(
        { success: false, message: "User with this email already exists" },
        { status: 409 }
      );
    }

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
