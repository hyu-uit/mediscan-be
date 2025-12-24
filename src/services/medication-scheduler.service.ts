import prisma from "../utils/prisma";
import { medicationReminderQueue } from "../queues/medication.queue";

/**
 * Schedule medication reminders for a specific user for today
 */
export const scheduleUserMedications = async (userId: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get user settings for time slots
  const userSettings = await prisma.userSettings.findUnique({
    where: { userId },
  });

  if (!userSettings) {
    console.log(`No settings found for user ${userId}`);
    return;
  }

  // Get all active medications with their schedules
  const medications = await prisma.medication.findMany({
    where: { userId, isActive: true },
    include: {
      schedules: {
        where: { isActive: true },
      },
    },
  });

  const timeSlotMapping: Record<string, string> = {
    MORNING: userSettings.morningTime,
    NOON: userSettings.noonTime,
    AFTERNOON: userSettings.afternoonTime,
    NIGHT: userSettings.nightTime,
    BEFORE_SLEEP: userSettings.beforeSleepTime,
  };

  for (const medication of medications) {
    for (const schedule of medication.schedules) {
      const scheduledTime =
        schedule.customTime || timeSlotMapping[schedule.timeSlot];
      const [hours, minutes] = scheduledTime.split(":").map(Number);

      const scheduledDateTime = new Date(today);
      scheduledDateTime.setHours(hours, minutes, 0, 0);

      // Skip if time has already passed
      if (scheduledDateTime < new Date()) {
        continue;
      }

      // Create medication log entry
      const medicationLog = await prisma.medicationLog.create({
        data: {
          userId,
          medicationId: medication.id,
          timeSlot: schedule.timeSlot,
          scheduledDate: today,
          scheduledTime,
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
          timeSlot: schedule.timeSlot,
          scheduledTime,
        },
        {
          delay,
          jobId: `reminder-${medicationLog.id}`,
        }
      );

      console.log(
        `📅 Scheduled reminder for ${
          medication.name
        } at ${scheduledTime} (in ${Math.round(delay / 60000)} mins)`
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
