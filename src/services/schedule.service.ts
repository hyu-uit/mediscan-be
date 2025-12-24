import prisma from "../utils/prisma";
import { TimeSlot } from "@prisma/client";
import { medicationReminderQueue } from "../queues/medication.queue";

interface CreateScheduleInput {
  medicationId: string;
  timeSlot: TimeSlot;
  customTime?: string;
}

interface UpdateScheduleInput {
  timeSlot?: TimeSlot;
  customTime?: string;
  isActive?: boolean;
}

const timeSlotMapping: Record<string, string> = {
  MORNING: "morningTime",
  NOON: "noonTime",
  AFTERNOON: "afternoonTime",
  NIGHT: "nightTime",
  BEFORE_SLEEP: "beforeSleepTime",
};

export const createSchedule = async (data: CreateScheduleInput) => {
  // Create the schedule in database
  const schedule = await prisma.schedule.create({
    data: {
      medicationId: data.medicationId,
      timeSlot: data.timeSlot,
      customTime: data.customTime,
    },
    include: {
      medication: {
        include: {
          user: {
            include: {
              settings: true,
            },
          },
        },
      },
    },
  });

  // Queue a reminder job for today if time hasn't passed
  await queueReminderForSchedule(schedule);

  return schedule;
};

/**
 * Queue a reminder job for a specific schedule
 */
async function queueReminderForSchedule(schedule: {
  id: string;
  timeSlot: TimeSlot;
  customTime: string | null;
  medication: {
    id: string;
    name: string;
    user: {
      id: string;
      settings: {
        morningTime: string;
        noonTime: string;
        afternoonTime: string;
        nightTime: string;
        beforeSleepTime: string;
      } | null;
    };
  };
}) {
  const { medication } = schedule;
  const { user } = medication;

  if (!user.settings) {
    console.log(`⚠️ No settings found for user ${user.id}, skipping schedule`);
    return;
  }

  // Get the scheduled time
  const settingsKey = timeSlotMapping[
    schedule.timeSlot
  ] as keyof typeof user.settings;
  const scheduledTime = schedule.customTime || user.settings[settingsKey];
  const [hours, minutes] = scheduledTime.split(":").map(Number);

  // Calculate scheduled datetime for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const scheduledDateTime = new Date(today);
  scheduledDateTime.setHours(hours, minutes, 0, 0);

  // Skip if time has already passed today
  if (scheduledDateTime <= new Date()) {
    console.log(
      `⏭️ Skipping ${medication.name} - ${schedule.timeSlot} (time already passed)`
    );
    return;
  }

  // Create medication log entry
  const medicationLog = await prisma.medicationLog.create({
    data: {
      userId: user.id,
      medicationId: medication.id,
      timeSlot: schedule.timeSlot,
      scheduledDate: today,
      scheduledTime,
      status: "MISSED", // Default, will be updated when taken
    },
  });

  // Calculate delay until scheduled time
  const delay = scheduledDateTime.getTime() - Date.now();

  // Add job to queue
  await medicationReminderQueue.add(
    "send-reminder",
    {
      medicationLogId: medicationLog.id,
      userId: user.id,
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
    `📅 Queued reminder for ${medication.name} (${
      schedule.timeSlot
    }) at ${scheduledTime} - in ${Math.round(delay / 60000)} mins`
  );
}

export const getSchedulesByMedication = async (medicationId: string) => {
  return prisma.schedule.findMany({
    where: { medicationId, isActive: true },
    orderBy: { createdAt: "asc" },
  });
};

export const updateSchedule = async (id: string, data: UpdateScheduleInput) => {
  return prisma.schedule.update({
    where: { id },
    data,
  });
};

export const deleteSchedule = async (id: string) => {
  return prisma.schedule.delete({
    where: { id },
  });
};
