import { NextResponse } from "next/server";
import {
  createRiskQuestion,
  getAllRiskQuestions,
} from "@/lib/models/RiskAssessment";

export async function GET() {
  try {
    const questions = await getAllRiskQuestions();
    return NextResponse.json({ success: true, questions });
  } catch (error) {
    console.error("[risk-assessment] GET ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch risk questions" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { question, options = [] } = body || {};

    if (!question?.trim()) {
      return NextResponse.json(
        { success: false, message: "Question is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(options) || options.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one option is required" },
        { status: 400 }
      );
    }

    const id = await createRiskQuestion(body);
    return NextResponse.json({
      success: true,
      message: "Risk question created",
      id: id.toString(),
    });
  } catch (error) {
    console.error("[risk-assessment] POST ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create risk question" },
      { status: 500 }
    );
  }
}
