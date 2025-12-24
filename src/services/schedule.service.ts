import prisma from "../utils/prisma";
import {
  FrequencyType,
  DosageUnit,
  IntervalUnit,
  TimeSlot,
} from "@prisma/client";
import { medicationReminderQueue } from "../queues/medication.queue";

interface IntakeTime {
  id: string;
  time: string;
  type: TimeSlot;
}

interface MedicationInput {
  id: string; // Frontend-generated ID (not used for DB)
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

interface CreateScheduleInput {
  medicationId: string;
  time: string; // e.g., "08:00 AM"
  type: string; // e.g., "MORNING", "NOON" - for UI color
}

interface UpdateScheduleInput {
  time?: string;
  type?: string;
  isActive?: boolean;
}

// Convert "08:00 AM" to hours and minutes
function parseTime(timeStr: string): { hours: number; minutes: number } {
  const parts = timeStr.split(" ");
  const [hours, minutes] = parts[0].split(":").map(Number);

  if (parts.length === 2) {
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
 * Create multiple medications with their schedules in a single transaction
 * and queue reminders for today
 */
export const createBulkMedicationsWithSchedules = async (
  userId: string,
  medications: MedicationInput[]
) => {
  const createdMedications = await prisma.$transaction(async (tx) => {
    const results = [];

    for (const med of medications) {
      // Create medication
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

      // Create schedules for this medication
      if (med.intakeTimes && med.intakeTimes.length > 0) {
        await tx.schedule.createMany({
          data: med.intakeTimes.map((intake) => ({
            medicationId: medication.id,
            time: intake.time,
            type: intake.type,
          })),
        });
      }

      // Fetch medication with schedules
      const medicationWithSchedules = await tx.medication.findUnique({
        where: { id: medication.id },
        include: { schedules: true },
      });

      results.push(medicationWithSchedules);
    }

    return results;
  });

  // Queue reminders for today (outside transaction)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const medication of createdMedications) {
    if (!medication) continue;

    for (const schedule of medication.schedules) {
      const { hours, minutes } = parseTime(schedule.time);

      const scheduledDateTime = new Date(today);
      scheduledDateTime.setHours(hours, minutes, 0, 0);

      // Skip if time has already passed today
      if (scheduledDateTime <= new Date()) {
        console.log(
          `⏭️ Skipping ${medication.name} at ${schedule.time} (time already passed)`
        );
        continue;
      }

      // Create medication log entry
      const medicationLog = await prisma.medicationLog.create({
        data: {
          userId,
          medicationId: medication.id,
          timeSlot: schedule.type as TimeSlot,
          scheduledDate: today,
          scheduledTime: schedule.time,
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
          userId,
          medicationId: medication.id,
          medicationName: medication.name,
          timeSlot: schedule.type,
          scheduledTime: schedule.time,
        },
        {
          delay,
          jobId: `reminder-${medicationLog.id}`,
        }
      );

      console.log(
        `📅 Queued reminder for ${medication.name} at ${
          schedule.time
        } (in ${Math.round(delay / 60000)} mins)`
      );
    }
  }

  return createdMedications;
};

export const createSchedule = async (data: CreateScheduleInput) => {
  return prisma.schedule.create({
    data: {
      medicationId: data.medicationId,
      time: data.time,
      type: data.type,
    },
    include: {
      medication: true,
    },
  });
};

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
