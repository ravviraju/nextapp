import clientPromise from "../mongodb";

// Account management
export async function createAccount({ name, type }) {
  // type: "asset", "liability", "equity", "revenue", "expense"
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection("accounts");
  const result = await collection.insertOne({ name, type, createdAt: new Date() });
  return result.insertedId;
}

export async function getAllAccounts() {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection("accounts");
  return await collection.find({}).toArray();
}

// Transaction handling (income / expense)
export async function recordTransaction({ accountId, amount, type, description, date }) {
  // type: "income" or "expense"
  const client = await clientPromise;
  const db = client.db();
  const { ObjectId } = await import("mongodb");
  const collection = db.collection("transactions");
  const txn = {
    accountId: new ObjectId(accountId),
    amount: Number(amount),
    type,
    description: description || "",
    date: date ? new Date(date) : new Date(),
    createdAt: new Date(),
  };
  const result = await collection.insertOne(txn);
  return result.insertedId;
}

export async function getTransactions({ startDate, endDate, accountId } = {}) {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection("transactions");
  const match = {};
  if (startDate) match.date = { $gte: new Date(startDate) };
  if (endDate) {
    match.date = match.date || {};
    match.date.$lte = new Date(endDate);
  }
  if (accountId) {
    const { ObjectId } = await import("mongodb");
    match.accountId = new ObjectId(accountId);
  }
  return await collection.find(match).sort({ date: 1 }).toArray();
}

// General Ledger – combines accounts with their transactions
export async function getGeneralLedger({ startDate, endDate } = {}) {
  const client = await clientPromise;
  const db = client.db();
  const accounts = await db.collection("accounts").find({}).toArray();
  const transactions = await getTransactions({ startDate, endDate });
  const ledger = accounts.map(acc => {
    const accTxns = transactions.filter(t => t.accountId?.toString() === acc._id?.toString());
    const debit = accTxns.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    const credit = accTxns.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    return {
      accountId: acc._id,
      name: acc.name,
      type: acc.type,
      debit,
      credit,
      balance: credit - debit,
    };
  });
  return ledger;
}

// Profit & Loss report
export async function getProfitLoss({ startDate, endDate }) {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection("transactions");
  const match = {};
  if (startDate) match.date = { $gte: new Date(startDate) };
  if (endDate) {
    match.date = match.date || {};
    match.date.$lte = new Date(endDate);
  }
  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
      },
    },
  ];
  const results = await collection.aggregate(pipeline).toArray();
  const income = results.find(r => r._id === "income")?.total || 0;
  const expense = results.find(r => r._id === "expense")?.total || 0;
  return { income, expense, profit: income - expense };
}
