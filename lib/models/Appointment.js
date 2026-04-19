import clientPromise from "../mongodb";

function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

function formatMinutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export async function createAppointment({
  doctorId,
  date,
  time,
  patientName,
  patientPhone,
  notes,
  userId,
}) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("appointments");
    const { ObjectId } = await import("mongodb");

    const _id = new ObjectId(doctorId);
    const doctcollection = db.collection("doctors");
    const doctor = await doctcollection.findOne({ _id });

    const doctorIdObj = new ObjectId(doctorId);

    let tokenNumber = 0;
    try {
      const [y, m, d] = date.split('-');
      const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const weekday = days[dateObj.getDay()];

      const scheduleObj = doctor.schedule?.find(s => s.day === weekday);
      if (scheduleObj && scheduleObj.slots && scheduleObj.slots.length > 0) {
        const duration = doctor.consultationDuration || 15;
        let allSlots = [];
        for (const shift of scheduleObj.slots) {
          if (!shift.start || !shift.end) continue;
          const shiftStartMins = parseTimeToMinutes(shift.start);
          const shiftEndMins = parseTimeToMinutes(shift.end);
          let currentMins = shiftStartMins;
          while (currentMins + duration <= shiftEndMins) {
            allSlots.push(formatMinutesToTime(currentMins));
            currentMins += duration;
          }
        }
        
        // Find index of the booked time in the generated slots array
        const index = allSlots.indexOf(time);
        if (index !== -1) {
          tokenNumber = index + 1;
        }
      }
    } catch(err) {
      console.error("Error computing token number:", err);
    }
    
    if (tokenNumber === 0) {
      const previousAppointmentsCount = await collection.countDocuments({
        doctorId: doctorIdObj,
        date: date
      });
      tokenNumber = previousAppointmentsCount + 1;
    }

    const doc = {
      doctorId: doctorIdObj,
      tokenNumber,
      fee: doctor.fee,
      date,
      time,
      patientName: patientName || "",
      patientPhone: patientPhone || "",
      notes: notes || "",
      status: "waiting",
      createdAt: new Date(),
      ...(userId && { userId: new ObjectId(userId) }),
    };

    const result = await collection.insertOne(doc);
    return result.insertedId;
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw error;
  }
}

export async function getAllAppointments() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("appointments");

    const appointments = await collection
      .aggregate([
        {
          $lookup: {
            from: "doctors",
            localField: "doctorId",
            foreignField: "_id",
            as: "doctor",
          },
        },
        {
          $unwind: {
            path: "$doctor",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "specializations",
            localField: "doctor.specializationId",
            foreignField: "_id",
            as: "specialization",
          },
        },
        {
          $unwind: {
            path: "$specialization",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $sort: {
            date: 1,
            time: 1,
            createdAt: -1,
          },
        },
      ])
      .toArray();

    return appointments;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
}

export async function getAppointmentsForUser(userId) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("appointments");
    const { ObjectId } = await import("mongodb");

    const _userId = new ObjectId(userId);

    const appointments = await collection
      .aggregate([
        {
          $match: {
            userId: _userId,
          },
        },
        {
          $lookup: {
            from: "doctors",
            localField: "doctorId",
            foreignField: "_id",
            as: "doctor",
          },
        },
        {
          $unwind: {
            path: "$doctor",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "specializations",
            localField: "doctor.specializationId",
            foreignField: "_id",
            as: "specialization",
          },
        },
        {
          $unwind: {
            path: "$specialization",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $sort: {
            date: 1,
            time: 1,
            createdAt: -1,
          },
        },
      ])
      .toArray();

    return appointments;
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    throw error;
  }
}


