import RiskQuestionForm from "../../_components/RiskQuestionForm";
import { getRiskQuestionById } from "@/lib/models/RiskAssessment";

export default async function EditRiskQuestionPage({ params }) {
  const { id } = await params;
  const question = await getRiskQuestionById(id);

  if (!question) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-red-600">Risk question not found.</p>
      </div>
    );
  }

  return (
    <RiskQuestionForm
      mode="edit"
      questionId={id}
      initialData={question}
    />
  );
}
