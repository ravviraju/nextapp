"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadImage(file) {
  if (!file) return "";
  const imageData = await toDataUrl(file);

  const res = await fetch("/api/upload-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageData,
      folder: "risk_assessment",
    }),
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || "Image upload failed");
  }
  return data.url;
}

const emptyOption = () => ({
  _id: "",
  option: "",
  score: "",
  image: "",
  imageFile: null,
});

export default function RiskQuestionForm({
  mode = "create",
  questionId = "",
  initialData = null,
}) {
  const router = useRouter();
  const [question, setQuestion] = useState(initialData?.question || "");
  const [link, setLink] = useState(initialData?.link || "");
  const [status, setStatus] = useState(initialData?.status || "active");
  const [questionImage, setQuestionImage] = useState(initialData?.image || "");
  const [questionImageFile, setQuestionImageFile] = useState(null);
  const [options, setOptions] = useState(
    initialData?.options?.length
      ? initialData.options.map((opt) => ({
          _id: opt._id || "",
          option: opt.option || "",
          score: opt.score ?? "",
          image: opt.image || "",
          imageFile: null,
        }))
      : [emptyOption()]
  );
  const [loading, setLoading] = useState(false);
  const [deletingOptionId, setDeletingOptionId] = useState("");

  const canSubmit = useMemo(() => {
    if (!question.trim()) return false;
    const validOptions = options.filter((opt) => opt.option.trim());
    return validOptions.length > 0;
  }, [question, options]);

  const updateOption = (index, updates) => {
    setOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, ...updates } : opt))
    );
  };

  const handleDeletePersistedOption = async (optionId) => {
    if (!questionId || !optionId) return;
    if (!window.confirm("Delete this option?")) return;
    try {
      setDeletingOptionId(optionId);
      const res = await fetch(
        `/api/risk-assessment/${questionId}/options/${optionId}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to delete option");
      }
      setOptions((prev) => prev.filter((opt) => opt._id !== optionId));
    } catch (error) {
      alert(error.message || "Failed to delete option");
    } finally {
      setDeletingOptionId("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setLoading(true);

      let finalQuestionImage = questionImage;
      if (questionImageFile) {
        finalQuestionImage = await uploadImage(questionImageFile);
      }

      const finalOptions = [];
      for (const opt of options) {
        if (!opt.option.trim()) continue;

        let optionImage = opt.image || "";
        if (opt.imageFile) {
          optionImage = await uploadImage(opt.imageFile);
        }

        finalOptions.push({
          _id: opt._id || undefined,
          option: opt.option.trim(),
          score: opt.score === "" ? 0 : Number(opt.score),
          image: optionImage,
        });
      }

      const payload = {
        question: question.trim(),
        link: link.trim(),
        status,
        image: finalQuestionImage,
        options: finalOptions,
      };

      const endpoint =
        mode === "edit"
          ? `/api/risk-assessment/${questionId}`
          : "/api/risk-assessment";
      const method = mode === "edit" ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to save");
      }

      alert(mode === "edit" ? "Question updated" : "Question created");
      router.push("/admin/riskassessment");
      router.refresh();
    } catch (error) {
      alert(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-5xl bg-white rounded-xl shadow p-6 space-y-5"
    >
      <h1 className="text-2xl font-semibold">
        {mode === "edit" ? "Edit Risk Question" : "Add Risk Question"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-700">Question</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            className="mt-1 w-full border rounded-md px-3 py-2"
            placeholder="Enter question"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Link</label>
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="mt-1 w-full border rounded-md px-3 py-2"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 w-full border rounded-md px-3 py-2"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-700">
            Question Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setQuestionImageFile(e.target.files?.[0] || null)}
            className="mt-1 w-full border rounded-md px-3 py-2"
          />
          {questionImage ? (
            <img
              src={questionImage}
              alt="Question"
              className="mt-2 h-20 w-20 object-cover rounded-md border"
            />
          ) : null}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Options</h2>
          <button
            type="button"
            onClick={() => setOptions((prev) => [...prev, emptyOption()])}
            className="px-3 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200"
          >
            Add Option
          </button>
        </div>

        {options.map((opt, index) => (
          <div
            key={opt._id || `new-${index}`}
            className="border rounded-lg p-4 grid grid-cols-1 md:grid-cols-12 gap-3"
          >
            <div className="md:col-span-5">
              <label className="text-sm font-medium text-gray-700">Option</label>
              <input
                value={opt.option}
                onChange={(e) => updateOption(index, { option: e.target.value })}
                className="mt-1 w-full border rounded-md px-3 py-2"
                placeholder={`Option ${index + 1}`}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Score</label>
              <input
                type="number"
                value={opt.score}
                onChange={(e) => updateOption(index, { score: e.target.value })}
                className="mt-1 w-full border rounded-md px-3 py-2"
                placeholder="0"
              />
            </div>

            <div className="md:col-span-3">
              <label className="text-sm font-medium text-gray-700">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  updateOption(index, { imageFile: e.target.files?.[0] || null })
                }
                className="mt-1 w-full border rounded-md px-3 py-2"
              />
              {opt.image ? (
                <img
                  src={opt.image}
                  alt="Option"
                  className="mt-2 h-14 w-14 object-cover rounded-md border"
                />
              ) : null}
            </div>

            <div className="md:col-span-2 flex items-end gap-2">
              <button
                type="button"
                onClick={() =>
                  setOptions((prev) => prev.filter((_, i) => i !== index))
                }
                className="w-full px-3 py-2 text-sm rounded-md bg-red-50 text-red-700 hover:bg-red-100"
              >
                Remove
              </button>
              {mode === "edit" && opt._id ? (
                <button
                  type="button"
                  onClick={() => handleDeletePersistedOption(opt._id)}
                  disabled={deletingOptionId === opt._id}
                  className="w-full px-3 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {deletingOptionId === opt._id ? "Deleting..." : "Delete DB"}
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!canSubmit || loading}
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Saving..." : mode === "edit" ? "Update" : "Create"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/riskassessment")}
          className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
