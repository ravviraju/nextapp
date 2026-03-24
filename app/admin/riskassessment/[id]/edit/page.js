"use client";

import { useEffect, useState } from "react";
import RiskQuestionForm from "../../_components/RiskQuestionForm";

export default function EditRiskQuestionPage({ params }) {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const { id } = params;
        const res = await fetch(`/api/risk-assessment/${id}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (data.success) {
          setQuestion(data.question);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [params]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

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
      questionId={question._id}
      initialData={question}
    />
  );
}
