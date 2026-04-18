import clientPromise from "../mongodb";

export async function getAllAdmissions() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("ip_admissions");

    const admissions = await collection.aggregate([
      {
        $lookup: {
          from: "beds",
          localField: "bedId",
          foreignField: "_id",
          as: "bed",
        },
      },
      {
        $unwind: {
          path: "$bed",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: { admissionDate: -1 },
      },
    ]).toArray();

    return admissions;
  } catch (error) {
    console.error("Error fetching admissions:", error);
    throw error;
  }
}

export async function getAdmissionById(id) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("ip_admissions");
    const { ObjectId } = await import("mongodb");

    const admissionArr = await collection.aggregate([
      { $match: { _id: new ObjectId(id) } },
      {
        $lookup: {
          from: "beds",
          localField: "bedId",
          foreignField: "_id",
          as: "bed",
        },
      },
      {
        $unwind: {
          path: "$bed",
          preserveNullAndEmptyArrays: true,
        },
      }
    ]).toArray();

    return admissionArr[0] || null;
  } catch (error) {
    console.error("Error fetching admission by id:", error);
    throw error;
  }
}

export async function admitPatient({
  patientName,
  patientPhone,
  patientAge,
  patientGender,
  address,
  bedId,
}) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("ip_admissions");
    const bedCollection = db.collection("beds");
    const { ObjectId } = await import("mongodb");

    const bedObjId = new ObjectId(bedId);
    
    // Check if bed is available
    const bed = await bedCollection.findOne({ _id: bedObjId });
    if (!bed || bed.status !== "available") {
      throw new Error("Bed is not available");
    }

    const doc = {
      patientName: patientName || "",
      patientPhone: patientPhone || "",
      patientAge: patientAge || null,
      patientGender: patientGender || "",
      address: address || "",
      bedId: bedObjId,
      status: "admitted",
      admissionDate: new Date(),
      dischargeDate: null,
      charges: [], // Array of { description, category: 'test'|'medicine'|'other', quantity, unitPrice, amount, date }
      roomCharges: 0,
      totalBill: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(doc);

    // Update bed status
    await bedCollection.updateOne({ _id: bedObjId }, { $set: { status: "occupied" } });

    return result.insertedId;
  } catch (error) {
    console.error("Error admitting patient:", error);
    throw error;
  }
}

export async function addChargeToAdmission(admissionId, { description, category, quantity, unitPrice }) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("ip_admissions");
    const { ObjectId } = await import("mongodb");

    const qty = Number(quantity);
    const price = Number(unitPrice);
    const amount = qty * price;

    const chargeItem = {
      _id: new ObjectId(),
      description,
      category,
      quantity: qty,
      unitPrice: price,
      amount,
      date: new Date(),
    };

    await collection.updateOne(
      { _id: new ObjectId(admissionId) },
      { 
        $push: { charges: chargeItem },
        $inc: { totalBill: amount },
        $set: { updatedAt: new Date() }
      }
    );

    return chargeItem;
  } catch (error) {
    console.error("Error adding charge:", error);
    throw error;
  }
}

export async function dischargePatient(admissionId) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("ip_admissions");
    const bedCollection = db.collection("beds");
    const { ObjectId } = await import("mongodb");

    const admission = await collection.findOne({ _id: new ObjectId(admissionId) });
    if (!admission || admission.status === "discharged") {
      throw new Error("Invalid or already discharged admission");
    }

    const bed = await bedCollection.findOne({ _id: admission.bedId });
    const dailyRate = bed ? bed.dailyRate : 0;
    
    // Calculate days stayed (minimum 1 day)
    const dischargeDate = new Date();
    const admissionDate = new Date(admission.admissionDate);
    const diffTime = Math.abs(dischargeDate - admissionDate);
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    
    const roomCharges = diffDays * dailyRate;

    await collection.updateOne(
      { _id: new ObjectId(admissionId) },
      {
        $set: {
          status: "discharged",
          dischargeDate,
          roomCharges,
          updatedAt: new Date()
        },
        $inc: {
          totalBill: roomCharges
        }
      }
    );

    // Free the bed
    if (admission.bedId) {
      await bedCollection.updateOne(
        { _id: admission.bedId },
        { $set: { status: "available" } }
      );
    }

    return true;
  } catch (error) {
    console.error("Error discharging patient:", error);
    throw error;
  }
}
