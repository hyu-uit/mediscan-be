import prisma from "../utils/prisma";
import { medicationMissedQueue } from "../queues/medication.queue";
import { DEFAULTS } from "../constants";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { parseTime } from "../utils/time";

export async function markMedicationTaken(medicationLogId: string) {
  if (!medicationLogId)
    throw new BadRequestError("medicationLogId is required");

  const medicationLog = await prisma.medicationLog.findUnique({
    where: { id: medicationLogId },
  });

  if (!medicationLog) throw new NotFoundError("Medication log");

  const now = new Date();
  const { hours, minutes } = parseTime(medicationLog.scheduledTime);

  const scheduledDateTime = new Date(medicationLog.scheduledDate);
  scheduledDateTime.setHours(hours, minutes, 0, 0);

  const diffMinutes = (now.getTime() - scheduledDateTime.getTime()) / 60000;
  const status =
    diffMinutes <= DEFAULTS.LATE_THRESHOLD_MINUTES ? "CONFIRMED" : "LATE";

  const updated = await prisma.medicationLog.update({
    where: { id: medicationLogId },
    data: { status, takenAt: now },
  });

  await removeMissedCheckJob(medicationLogId);

  return updated;
}

export async function skipMedication(medicationLogId: string) {
  if (!medicationLogId)
    throw new BadRequestError("medicationLogId is required");

  const existing = await prisma.medicationLog.findUnique({
    where: { id: medicationLogId },
  });

  if (!existing) throw new NotFoundError("Medication log");

  const updated = await prisma.medicationLog.update({
    where: { id: medicationLogId },
    data: { status: "SKIPPED" },
  });

  await removeMissedCheckJob(medicationLogId);

  return updated;
}

export async function getMedicationLogs(userId: string, date?: Date) {
  if (!userId) throw new BadRequestError("userId is required");

  const targetDate = date ? new Date(date) : new Date();
  targetDate.setHours(0, 0, 0, 0);

  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  return prisma.medicationLog.findMany({
    where: {
      userId,
      scheduledDate: { gte: targetDate, lt: nextDay },
    },
    include: { medication: true },
    orderBy: { scheduledTime: "asc" },
  });
}

async function removeMissedCheckJob(medicationLogId: string): Promise<void> {
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
}
