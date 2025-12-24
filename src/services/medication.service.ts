import prisma from "../utils/prisma";
import {
  FrequencyType,
  DosageUnit,
  IntervalUnit,
  TimeSlot,
} from "@prisma/client";

interface IntakeTime {
  id: string;
  time: string; // e.g., "08:00 AM" - stored as-is
  type: TimeSlot; // TimeSlot values for UI color
}

interface CreateMedicationInput {
  userId: string;
  name: string;
  dosage?: string;
  unit?: DosageUnit;
  instructions?: string;
  notes?: string;
  frequencyType?: FrequencyType;
  intervalValue?: number;
  intervalUnit?: IntervalUnit;
  selectedDays?: string[];
  intakeTimes?: IntakeTime[];
  imageUrl?: string;
}

export const createMedication = async (data: CreateMedicationInput) => {
  // Create medication with schedules in a transaction
  return prisma.$transaction(async (tx) => {
    // Create medication
    const medication = await tx.medication.create({
      data: {
        userId: data.userId,
        name: data.name,
        dosage: data.dosage,
        unit: data.unit || "MG",
        instructions: data.instructions,
        notes: data.notes,
        frequencyType: data.frequencyType || "DAILY",
        intervalValue: data.intervalValue || 1,
        intervalUnit: data.intervalUnit || "DAYS",
        selectedDays: data.selectedDays || [],
        imageUrl: data.imageUrl,
      },
    });

    // Create schedules from intakeTimes
    if (data.intakeTimes && data.intakeTimes.length > 0) {
      const schedules = data.intakeTimes.map((intake) => ({
        medicationId: medication.id,
        time: intake.time,
        type: intake.type,
      }));

      await tx.schedule.createMany({
        data: schedules,
      });
    }

    // Return medication with schedules
    return tx.medication.findUnique({
      where: { id: medication.id },
      include: { schedules: true },
    });
  });
};

export const getMedications = async (userId: string) => {
  return prisma.medication.findMany({
    where: { userId, isActive: true },
    include: { schedules: true },
    orderBy: { createdAt: "desc" },
  });
};

export const getMedicationById = async (id: string) => {
  return prisma.medication.findUnique({
    where: { id },
    include: { schedules: true },
  });
};

interface UpdateMedicationInput {
  name?: string;
  dosage?: string;
  unit?: DosageUnit;
  instructions?: string;
  notes?: string;
  frequencyType?: FrequencyType;
  intervalValue?: number;
  intervalUnit?: IntervalUnit;
  selectedDays?: string[];
  intakeTimes?: IntakeTime[];
  imageUrl?: string;
  isActive?: boolean;
}

export const updateMedication = async (
  id: string,
  data: UpdateMedicationInput
) => {
  const { intakeTimes, ...medicationData } = data;

  return prisma.$transaction(async (tx) => {
    // Update medication
    const medication = await tx.medication.update({
      where: { id },
      data: medicationData,
    });

    // If intakeTimes are provided, replace all schedules
    if (intakeTimes !== undefined) {
      // Delete existing schedules
      await tx.schedule.deleteMany({
        where: { medicationId: id },
      });

      // Create new schedules
      if (intakeTimes.length > 0) {
        const schedules = intakeTimes.map((intake) => ({
          medicationId: id,
          time: intake.time,
          type: intake.type,
        }));

        await tx.schedule.createMany({
          data: schedules,
        });
      }
    }

    // Return medication with updated schedules
    return tx.medication.findUnique({
      where: { id },
      include: { schedules: true },
    });
  });
};

export const deleteMedication = async (id: string) => {
  return prisma.medication.delete({
    where: { id },
  });
};
