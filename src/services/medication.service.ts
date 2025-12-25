import prisma from "../utils/prisma";
import { CreateMedicationInput, UpdateMedicationInput } from "../types";
import { DEFAULTS } from "../constants";
import { BadRequestError, NotFoundError } from "../utils/errors";

export async function createMedication(data: CreateMedicationInput) {
  if (!data.userId) throw new BadRequestError("userId is required");
  if (!data.name) throw new BadRequestError("name is required");

  return prisma.$transaction(async (tx) => {
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
}

export async function getMedications(userId: string) {
  if (!userId) throw new BadRequestError("userId is required");

  return prisma.medication.findMany({
    where: { userId, isActive: true },
    include: { schedules: true },
    orderBy: { createdAt: "desc" },
  });
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
