import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    const appointmentsAgg = await db.collection("appointments").aggregate([
      { $group: { _id: null, total: { $sum: { $toDouble: "$fee" } } } }
    ]).toArray();

    const labBillsAgg = await db.collection("labBills").aggregate([
      { $group: { _id: null, total: { $sum: { $toDouble: "$total" } } } }
    ]).toArray();

    const pharmaBillsAgg = await db.collection("pharmaBills").aggregate([
      { $group: { _id: null, total: { $sum: { $toDouble: "$total" } } } }
    ]).toArray();

    const ipAgg = await db.collection("ip_admissions").aggregate([
      { $group: { _id: null, total: { $sum: { $toDouble: "$totalBill" } } } }
    ]).toArray();

    const apptsRevenue = appointmentsAgg.length > 0 ? appointmentsAgg[0].total : 0;
    const labRevenue = labBillsAgg.length > 0 ? labBillsAgg[0].total : 0;
    const pharmaRevenue = pharmaBillsAgg.length > 0 ? pharmaBillsAgg[0].total : 0;
    const ipRevenue = ipAgg.length > 0 ? ipAgg[0].total : 0;
    // To accommodate "tests revenue", we map lab bills since labs conduct tests.
    // We provide pharma revenue as well if the user has a pharmacy.
    const testsRevenue = labRevenue;
    
    // As per user request: "appts. revenue and lab revenue and tests revenue... total revenue"
    // Since lab and tests are usually the same, we'll keep the sum logical, so total doesn't double-count lab and test.
    const totalRevenue = apptsRevenue + labRevenue + pharmaRevenue + ipRevenue;

    return NextResponse.json({
      appointmentsRevenue: apptsRevenue,
      labRevenue: labRevenue,
      testsRevenue: testsRevenue,
      pharmaRevenue: pharmaRevenue,
      ipRevenue: ipRevenue,
      totalRevenue: totalRevenue,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
