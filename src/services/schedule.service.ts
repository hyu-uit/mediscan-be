import prisma from "../utils/prisma";
import {
  FrequencyType,
  DosageUnit,
  IntervalUnit,
  TimeSlot,
} from "@prisma/client";
import { medicationReminderQueue } from "../queues/medication.queue";
import {
  hasTimePassed,
  getDelayUntil,
  shouldScheduleToday,
  MedicationFrequency,
} from "../utils/time";
import { BadRequestError } from "../utils/errors";

interface IntakeTime {
  id: string;
  time: string;
  type: TimeSlot;
}

interface MedicationInput {
  id: string;
  name: string;
  dosage?: string;
  unit?: DosageUnit;
  instructions?: string;
  notes?: string;
  frequencyType?: FrequencyType;
  intervalValue?: string;
  intervalUnit?: IntervalUnit;
  selectedDays?: string[];
  intakeTimes?: IntakeTime[];
}

interface MedicationWithSchedules extends MedicationFrequency {
  id: string;
  name: string;
  schedules: Array<{ id: string; time: string; type: string }>;
}

// Create medications and schedules in transaction
async function createMedicationsInTransaction(
  userId: string,
  medications: MedicationInput[]
) {
  return prisma.$transaction(async (tx) => {
    const results: (MedicationWithSchedules | null)[] = [];

    for (const med of medications) {
      const medication = await tx.medication.create({
        data: {
          userId,
          name: med.name,
          dosage: med.dosage,
          unit: med.unit || "MG",
          instructions: med.instructions,
          notes: med.notes,
          frequencyType: med.frequencyType || "DAILY",
          intervalValue: med.intervalValue
            ? parseInt(med.intervalValue, 10)
            : 1,
          intervalUnit: med.intervalUnit || "DAYS",
          selectedDays: med.selectedDays || [],
        },
      });

      if (med.intakeTimes && med.intakeTimes.length > 0) {
        await tx.schedule.createMany({
          data: med.intakeTimes.map((intake) => ({
            medicationId: medication.id,
            time: intake.time,
            type: intake.type,
          })),
        });
      }

      const medicationWithSchedules = await tx.medication.findUnique({
        where: { id: medication.id },
        include: { schedules: true },
      });

      results.push(medicationWithSchedules);
    }

    return results;
  });
}

// Queue a single reminder
async function queueSingleReminder(
  userId: string,
  medication: MedicationWithSchedules,
  schedule: { id: string; time: string; type: string }
): Promise<boolean> {
  try {
    if (hasTimePassed(schedule.time)) {
      console.log(
        `⏭️ Skipping ${medication.name} at ${schedule.time} (passed)`
      );
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const medicationLog = await prisma.medicationLog.create({
      data: {
        userId,
        medicationId: medication.id,
        timeSlot: schedule.type as TimeSlot,
        scheduledDate: today,
        scheduledTime: schedule.time,
        status: "MISSED",
      },
    });

    const delay = getDelayUntil(schedule.time);

    await medicationReminderQueue.add(
      "send-reminder",
      {
        medicationLogId: medicationLog.id,
        userId,
        medicationId: medication.id,
        medicationName: medication.name,
        timeSlot: schedule.type,
        scheduledTime: schedule.time,
      },
      { delay, jobId: `reminder-${medicationLog.id}` }
    );

    console.log(
      `📅 Queued ${medication.name} at ${schedule.time} (${Math.round(
        delay / 60000
      )} mins)`
    );
    return true;
  } catch (error) {
    console.error(`❌ Failed to queue ${medication.name}:`, error);
    return false;
  }
}

// Queue reminders for all medications
async function queueRemindersForMedications(
  userId: string,
  medications: (MedicationWithSchedules | null)[]
) {
  const promises: Promise<boolean>[] = [];

  for (const medication of medications) {
    if (!medication) continue;

    // Check if medication should be scheduled today based on frequency
    if (!shouldScheduleToday(medication)) {
      console.log(
        `⏭️ Skipping ${medication.name} (not scheduled for today based on frequency)`
      );
      continue;
    }

    for (const schedule of medication.schedules) {
      promises.push(queueSingleReminder(userId, medication, schedule));
    }
  }

  await Promise.all(promises);
}

// Public API
export async function createBulkMedicationsWithSchedules(
  userId: string,
  medications: MedicationInput[]
) {
  if (!userId) throw new BadRequestError("userId is required");
  if (!medications?.length)
    throw new BadRequestError("medications are required");

  const createdMedications = await createMedicationsInTransaction(
    userId,
    medications
  );
  await queueRemindersForMedications(userId, createdMedications);

  return createdMedications;
}

export async function createSchedule(data: {
  medicationId: string;
  time: string;
  type: string;
}) {
  if (!data.medicationId || !data.time || !data.type) {
    throw new BadRequestError("medicationId, time, and type are required");
  }

  return prisma.schedule.create({
    data: { medicationId: data.medicationId, time: data.time, type: data.type },
    include: { medication: true },
  });
}

export async function getSchedulesByMedication(medicationId: string) {
  if (!medicationId) throw new BadRequestError("medicationId is required");

  return prisma.schedule.findMany({
    where: { medicationId, isActive: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function updateSchedule(
  id: string,
  data: { time?: string; type?: string; isActive?: boolean }
) {
  if (!id) throw new BadRequestError("id is required");

  return prisma.schedule.update({ where: { id }, data });
}

export async function deleteSchedule(id: string) {
  if (!id) throw new BadRequestError("id is required");

  return prisma.schedule.delete({ where: { id } });
}

// Get today's schedule for home screen
export async function getTodaySchedule(userId: string) {
  if (!userId) throw new BadRequestError("userId is required");

  const medications = await prisma.medication.findMany({
    where: { userId, isActive: true },
    include: {
      schedules: {
        where: { isActive: true },
        orderBy: { time: "asc" },
      },
    },
  });

  // Filter medications that should be scheduled today
  const medicationsToday = medications.filter(shouldScheduleToday);

  // Flatten schedules with medication info
  const todaySchedules = medicationsToday.flatMap((medication) =>
    medication.schedules.map((schedule) => ({
      id: schedule.id,
      medicationId: medication.id,
      medicationName: medication.name,
      dosage: medication.dosage,
      unit: medication.unit,
      instructions: medication.instructions,
      time: schedule.time,
      timeSlot: schedule.type,
      isPassed: hasTimePassed(schedule.time),
    }))
  );

  // Sort by time
  todaySchedules.sort((a, b) => {
    const timeA = a.time.replace(/[^0-9:]/g, "");
    const timeB = b.time.replace(/[^0-9:]/g, "");
    return timeA.localeCompare(timeB);
  });

  // Count remaining (not passed)
  const remainingCount = todaySchedules.filter((s) => !s.isPassed).length;

  return {
    schedules: todaySchedules,
    totalCount: todaySchedules.length,
    remainingCount,
  };
}
