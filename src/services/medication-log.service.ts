import prisma from "../utils/prisma";
import { medicationMissedQueue } from "../queues/medication.queue";

/**
 * Mark a medication as taken (CONFIRMED or LATE)
 */
export const markMedicationTaken = async (medicationLogId: string) => {
  const medicationLog = await prisma.medicationLog.findUnique({
    where: { id: medicationLogId },
  });

  if (!medicationLog) {
    throw new Error("Medication log not found");
  }

  // Determine if taken on time or late
  const now = new Date();
  const [hours, minutes] = medicationLog.scheduledTime.split(":").map(Number);
  const scheduledDateTime = new Date(medicationLog.scheduledDate);
  scheduledDateTime.setHours(hours, minutes, 0, 0);

  const diffMinutes = (now.getTime() - scheduledDateTime.getTime()) / 60000;
  const status = diffMinutes <= 10 ? "CONFIRMED" : "LATE";

  // Update the medication log
  const updated = await prisma.medicationLog.update({
    where: { id: medicationLogId },
    data: {
      status,
      takenAt: now,
    },
  });

  // Remove the pending missed check job since user took the medication
  try {
    const job = await medicationMissedQueue.getJob(
      `missed-check-${medicationLogId}`
    );
    if (job) {
      await job.remove();
      console.log(`🗑️ Removed missed check job for ${medicationLogId}`);
    }
  } catch (error) {
    console.error("Error removing missed check job:", error);
  }

  return updated;
};

/**
 * Skip a medication intentionally
 */
export const skipMedication = async (medicationLogId: string) => {
  const updated = await prisma.medicationLog.update({
    where: { id: medicationLogId },
    data: {
      status: "SKIPPED",
    },
  });

  // Remove the pending missed check job
  try {
    const job = await medicationMissedQueue.getJob(
      `missed-check-${medicationLogId}`
    );
    if (job) {
      await job.remove();
    }
  } catch (error) {
    console.error("Error removing missed check job:", error);
  }

  return updated;
};

/**
 * Get medication logs for a user for a specific date
 */
export const getMedicationLogs = async (userId: string, date?: Date) => {
  const targetDate = date || new Date();
  targetDate.setHours(0, 0, 0, 0);

  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  return prisma.medicationLog.findMany({
    where: {
      userId,
      scheduledDate: {
        gte: targetDate,
        lt: nextDay,
      },
    },
    include: {
      medication: true,
    },
    orderBy: { scheduledTime: "asc" },
  });
};
