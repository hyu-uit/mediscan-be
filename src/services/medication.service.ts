import prisma from "../utils/prisma";
import {
  CreateMedicationInput,
  UpdateMedicationInput,
  MedicineResponse,
  MedicinesListResponse,
  DosageUnitType,
} from "../types";
import {
  DEFAULTS,
  DOSAGE_UNIT_MAP,
  FREQUENCY_TYPE_MAP,
  INTERVAL_UNIT_MAP,
} from "../constants";

// Helper to reverse lookup from a map
function reverseLookup<T>(
  map: Record<string, T>,
  value: T,
  defaultKey: string
): string {
  const entry = Object.entries(map).find(([, v]) => v === value);
  return entry ? entry[0] : defaultKey;
}
import { BadRequestError, NotFoundError } from "../utils/errors";
import { medicationReminderQueue } from "../queues/medication.queue";
import {
  hasTimePassed,
  getDelayUntil,
  shouldScheduleToday,
  getTodayUTC,
  MedicationFrequency,
} from "../utils/time";
import { TimeSlot } from "@prisma/client";

export async function createMedication(data: CreateMedicationInput) {
  if (!data.userId) throw new BadRequestError("userId is required");
  if (!data.name) throw new BadRequestError("name is required");

  console.log(`\n🚀 ========== CREATE MEDICATION ==========`);
  console.log(`👤 User: ${data.userId}`);
  console.log(`💊 Medication: ${data.name}`);

  const result = await prisma.$transaction(async (tx) => {
    const medication = await tx.medication.create({
      data: {
        userId: data.userId,
        name: data.name,
        dosage: data.dosage,
        unit: data.unit || DEFAULTS.DOSAGE_UNIT,
        instructions: data.instructions,
        notes: data.notes,
        frequencyType: data.frequencyType || DEFAULTS.FREQUENCY_TYPE,
        intervalValue: data.intervalValue || DEFAULTS.INTERVAL_VALUE,
        intervalUnit: data.intervalUnit || DEFAULTS.INTERVAL_UNIT,
        selectedDays: data.selectedDays || [],
        imageUrl: data.imageUrl,
      },
    });

    if (data.intakeTimes && data.intakeTimes.length > 0) {
      await tx.schedule.createMany({
        data: data.intakeTimes.map((intake) => ({
          medicationId: medication.id,
          time: intake.time,
          type: intake.type,
        })),
      });
    }

    return tx.medication.findUnique({
      where: { id: medication.id },
      include: { schedules: true },
    });
  });

  // Queue BullMQ reminders if medication created successfully
  if (result) {
    console.log(
      `✅ Created medication with ${result.schedules.length} schedules`
    );
    await queueRemindersForMedication(data.userId, result);
  }

  console.log(`🏁 ========== MEDICATION CREATED ==========\n`);

  return result;
}

// Queue reminders for a single medication
async function queueRemindersForMedication(
  userId: string,
  medication: MedicationFrequency & {
    id: string;
    name: string;
    schedules: Array<{ id: string; time: string; type: string }>;
  }
) {
  // Check if medication should be scheduled today based on frequency
  if (!shouldScheduleToday(medication)) {
    console.log(
      `⏭️ Skipping ${medication.name} (not scheduled for today based on frequency)`
    );
    return;
  }

  const today = getTodayUTC();
  let queuedCount = 0;
  let passedCount = 0;

  for (const schedule of medication.schedules) {
    const timePassed = hasTimePassed(schedule.time);
    const status = timePassed ? "MISSED" : "PENDING";

    // Create medication log
    const medicationLog = await prisma.medicationLog.create({
      data: {
        userId,
        medicationId: medication.id,
        scheduleId: schedule.id,
        timeSlot: schedule.type as TimeSlot,
        scheduledDate: today,
        scheduledTime: schedule.time,
        status,
      },
    });

    if (timePassed) {
      console.log(
        `⏭️ ${medication.name} at ${schedule.time} (already passed, marked as MISSED)`
      );
      passedCount++;
    } else {
      // Queue the reminder job for future times
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
      queuedCount++;
    }
  }

  console.log(
    `📊 Summary: ✅ Queued: ${queuedCount} | ⏰ Passed: ${passedCount}`
  );
}

export async function getMedications(userId: string) {
  if (!userId) throw new BadRequestError("userId is required");

  return prisma.medication.findMany({
    where: { userId, isActive: true },
    include: { schedules: true },
    orderBy: { createdAt: "desc" },
  });
}

// Helper function to format frequency string
function formatFrequencyString(medication: {
  frequencyType: string;
  intervalValue: number;
  intervalUnit: string;
  selectedDays: string[];
}): string {
  const frequencyType = reverseLookup(
    FREQUENCY_TYPE_MAP,
    medication.frequencyType,
    medication.frequencyType
  );

  if (frequencyType === "daily") {
    return "Daily";
  } else if (frequencyType === "interval") {
    const unit = reverseLookup(
      INTERVAL_UNIT_MAP,
      medication.intervalUnit,
      medication.intervalUnit
    );
    return `Every ${medication.intervalValue} ${unit}`;
  } else if (frequencyType === "specific-days") {
    const days = medication.selectedDays;
    if (days.length === 0) return "No days selected";
    if (days.length === 7) return "Daily";
    return days
      .map((d) => d.charAt(0).toUpperCase() + d.slice(1, 3))
      .join(", ");
  }
  return frequencyType;
}

// Helper function to get icon color based on first schedule type
function getIconColor(schedules: Array<{ type: string }>): string | undefined {
  if (schedules.length === 0) return undefined;

  const colorMap: Record<string, string> = {
    morning: "#FFB020",
    noon: "#FF6B6B",
    afternoon: "#4ECDC4",
    night: "#7C3AED",
    before_sleep: "#6366F1",
  };

  const firstType = schedules[0].type.toLowerCase();
  return colorMap[firstType];
}

export async function getMedicationsList(
  userId: string
): Promise<MedicinesListResponse> {
  if (!userId) throw new BadRequestError("userId is required");

  const medications = await prisma.medication.findMany({
    where: { userId },
    include: { schedules: true },
    orderBy: { createdAt: "desc" },
  });

  const formattedMedications: MedicineResponse[] = medications.map((med) => ({
    id: med.id,
    name: med.name,
    dosage: med.dosage || "",
    unit: reverseLookup(DOSAGE_UNIT_MAP, med.unit, "mg") as DosageUnitType,
    frequency: formatFrequencyString(med),
    instructions: med.instructions || "",
    status: med.isActive ? "active" : "inactive",
    iconColor: getIconColor(med.schedules),
  }));

  return {
    medications: formattedMedications,
    totalCount: medications.length,
  };
}

export async function getMedicationById(id: string) {
  if (!id) throw new BadRequestError("id is required");

  return prisma.medication.findUnique({
    where: { id },
    include: { schedules: true },
  });
}

export async function updateMedication(
  id: string,
  data: UpdateMedicationInput
) {
  if (!id) throw new BadRequestError("id is required");

  const existing = await prisma.medication.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("Medication");

  const { intakeTimes, ...medicationData } = data;

  return prisma.$transaction(async (tx) => {
    await tx.medication.update({
      where: { id },
      data: medicationData,
    });

    if (intakeTimes !== undefined) {
      await tx.schedule.deleteMany({ where: { medicationId: id } });

      if (intakeTimes.length > 0) {
        await tx.schedule.createMany({
          data: intakeTimes.map((intake) => ({
            medicationId: id,
            time: intake.time,
            type: intake.type,
          })),
        });
      }
    }

    return tx.medication.findUnique({
      where: { id },
      include: { schedules: true },
    });
  });
}

export async function deleteMedication(id: string) {
  if (!id) throw new BadRequestError("id is required");

  const existing = await prisma.medication.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("Medication");

  return prisma.medication.delete({ where: { id } });
}
