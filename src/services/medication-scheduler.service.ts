import prisma from "../utils/prisma";
import { medicationReminderQueue } from "../queues/medication.queue";
import { TimeSlot } from "@prisma/client";

// Map schedule type to TimeSlot enum for medication logs
const typeToTimeSlot: Record<string, TimeSlot> = {
  morning: "MORNING",
  noon: "NOON",
  afternoon: "AFTERNOON",
  night: "NIGHT",
  before_sleep: "BEFORE_SLEEP",
};

// Convert "08:00 AM" to hours and minutes
function parseTime(timeStr: string): { hours: number; minutes: number } {
  // Handle both "08:00 AM" and "08:00" formats
  const parts = timeStr.split(" ");
  const [hours, minutes] = parts[0].split(":").map(Number);

  if (parts.length === 2) {
    // 12-hour format
    const modifier = parts[1];
    if (modifier === "PM" && hours !== 12) {
      return { hours: hours + 12, minutes };
    }
    if (modifier === "AM" && hours === 12) {
      return { hours: 0, minutes };
    }
  }

  return { hours, minutes };
}

/**
 * Schedule medication reminders for a specific user for today
 */
export const scheduleUserMedications = async (userId: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get all active medications with their schedules
  const medications = await prisma.medication.findMany({
    where: { userId, isActive: true },
    include: {
      schedules: {
        where: { isActive: true },
      },
    },
  });

  for (const medication of medications) {
    for (const schedule of medication.schedules) {
      const { hours, minutes } = parseTime(schedule.time);

      const scheduledDateTime = new Date(today);
      scheduledDateTime.setHours(hours, minutes, 0, 0);

      // Skip if time has already passed
      if (scheduledDateTime < new Date()) {
        continue;
      }

      // Convert type to TimeSlot for medication log
      const timeSlot = typeToTimeSlot[schedule.type] || "MORNING";

      // Create medication log entry
      const medicationLog = await prisma.medicationLog.create({
        data: {
          userId,
          medicationId: medication.id,
          timeSlot,
          scheduledDate: today,
          scheduledTime: schedule.time,
          status: "MISSED", // Default to MISSED, will be updated when taken
        },
      });

      // Calculate delay until scheduled time
      const delay = scheduledDateTime.getTime() - Date.now();

      // Add job to queue
      await medicationReminderQueue.add(
        "send-reminder",
        {
          medicationLogId: medicationLog.id,
          userId,
          medicationId: medication.id,
          medicationName: medication.name,
          timeSlot,
          scheduledTime: schedule.time,
        },
        {
          delay,
          jobId: `reminder-${medicationLog.id}`,
        }
      );

      console.log(
        `📅 Scheduled reminder for ${medication.name} at ${
          schedule.time
        } (in ${Math.round(delay / 60000)} mins)`
      );
    }
  }
};

/**
 * Schedule medications for all users (run this daily via cron)
 */
export const scheduleAllUserMedications = async () => {
  console.log("🚀 Starting daily medication scheduling...");

  const users = await prisma.user.findMany({
    select: { id: true },
  });

  for (const user of users) {
    await scheduleUserMedications(user.id);
  }

  console.log(`✅ Scheduled medications for ${users.length} users`);
};
