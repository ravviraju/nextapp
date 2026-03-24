import { NextResponse } from "next/server";
import {
  getRiskQuestionById,
  updateRiskQuestion,
} from "@/lib/models/RiskAssessment";

export async function GET(_req, { params }) {
  try {
    const { id } = await params;
    const question = await getRiskQuestionById(id);

    if (!question) {
      return NextResponse.json(
        { success: false, message: "Risk question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, question });
  } catch (error) {
    console.error("[risk-assessment/:id] GET ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch risk question" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
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

    await updateRiskQuestion(id, body);
    return NextResponse.json({
      success: true,
      message: "Risk question updated",
    });
  } catch (error) {
    console.error("[risk-assessment/:id] PUT ERROR:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to update question" },
      { status: 500 }
    );
  }
}
