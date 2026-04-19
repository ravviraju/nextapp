import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

function parseTimeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

function formatMinutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');
    const dateStr = searchParams.get('date'); // YYYY-MM-DD

    if (!doctorId || !dateStr) {
      return NextResponse.json({ success: false, message: "doctorId and date are required" }, { status: 400 });
    }

    const { ObjectId } = await import("mongodb");
    const client = await clientPromise;
    const db = client.db();

    const doctor = await db.collection("doctors").findOne({ _id: new ObjectId(doctorId) });
    if (!doctor) {
      return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 });
    }

    // Check leaves
    if (doctor.leaves && doctor.leaves.includes(dateStr)) {
      return NextResponse.json({ success: true, slots: [] });
    }

    // Get weekday in local time
    const [y, m, d] = dateStr.split('-');
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const weekday = days[dateObj.getDay()];

    const scheduleObj = doctor.schedule?.find(s => s.day === weekday);
    if (!scheduleObj || !scheduleObj.slots || scheduleObj.slots.length === 0) {
      return NextResponse.json({ success: true, slots: [] });
    }

    const duration = doctor.consultationDuration || 15;
    let allSlots = [];

    // Generate slots
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

    // Fetch existing appointments
    const appointments = await db.collection("appointments").find({ 
      doctorId: new ObjectId(doctorId),
      date: dateStr,
      status: { $ne: "cancelled" }
    }).toArray();

    const bookedTimes = appointments.map(a => a.time);

    // Filter available slots
    const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));

    return NextResponse.json({ success: true, slots: availableSlots });
    
  } catch (error) {
    console.error("[doctors/slots] GET ERROR:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch slots" }, { status: 500 });
  }
}
