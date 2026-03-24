import clientPromise from "../mongodb";

function normalizeOption(option = {}) {
  return {
    _id: option._id || undefined,
    option: (option.option || "").trim(),
    score:
      option.score === "" || option.score == null
        ? 0
        : Number.parseFloat(option.score),
    image: option.image || "",
  };
}

function normalizeQuestion(question = {}) {
  const options = Array.isArray(question.options) ? question.options : [];

  return {
    question: (question.question || "").trim(),
    link: (question.link || "").trim(),
    status: question.status === "inactive" ? "inactive" : "active",
    image: question.image || "",
    options: options.map(normalizeOption).filter((opt) => opt.option),
  };
}

export async function getAllRiskQuestions() {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection("risk_questions");

  return collection.find({}).sort({ _id: -1 }).toArray();
}

export async function getRiskQuestionById(id) {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection("risk_questions");
  const { ObjectId } = await import("mongodb");

  if (!ObjectId.isValid(id)) {
    return null;
  }

  return collection.findOne({ _id: new ObjectId(id) });
}

export async function createRiskQuestion(payload) {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection("risk_questions");
  const { ObjectId } = await import("mongodb");

  const data = normalizeQuestion(payload);
  data.options = data.options.map((opt) => ({
    ...opt,
    _id: new ObjectId(),
  }));
  data.createdAt = new Date();
  data.updatedAt = new Date();

  const result = await collection.insertOne(data);
  return result.insertedId;
}

export async function updateRiskQuestion(id, payload) {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection("risk_questions");
  const { ObjectId } = await import("mongodb");

  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid question id");
  }

  const oldDoc = await collection.findOne({ _id: new ObjectId(id) });
  if (!oldDoc) {
    throw new Error("Question not found");
  }

  const data = normalizeQuestion(payload);
  data.options = data.options.map((opt) => ({
    ...opt,
    _id:
      opt._id && ObjectId.isValid(opt._id)
        ? new ObjectId(opt._id)
        : new ObjectId(),
  }));
  data.updatedAt = new Date();

  await collection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: data,
    }
  );
}

export async function deleteRiskOption(questionId, optionId) {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection("risk_questions");
  const { ObjectId } = await import("mongodb");

  if (!ObjectId.isValid(questionId) || !ObjectId.isValid(optionId)) {
    throw new Error("Invalid id");
  }

  const result = await collection.updateOne(
    { _id: new ObjectId(questionId) },
    {
      $pull: {
        options: { _id: new ObjectId(optionId) },
      },
      $set: { updatedAt: new Date() },
    }
  );

  return result.modifiedCount > 0;
}
