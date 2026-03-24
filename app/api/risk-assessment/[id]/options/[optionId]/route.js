import { NextResponse } from "next/server";
import { deleteRiskOption } from "@/lib/models/RiskAssessment";

export async function DELETE(_req, { params }) {
  try {
    const { id, optionId } = await params;
    const deleted = await deleteRiskOption(id, optionId);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Option not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Option deleted successfully",
    });
  } catch (error) {
    console.error("[risk-assessment/:id/options/:optionId] DELETE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete option" },
      { status: 500 }
    );
  }
}
