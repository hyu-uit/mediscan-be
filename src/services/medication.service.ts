import prisma from "../utils/prisma";

interface CreateMedicationInput {
  userId: string;
  name: string;
  dosage?: string;
  instructions?: string;
  imageUrl?: string;
}

export const createMedication = async (data: CreateMedicationInput) => {
  return prisma.medication.create({
    data: {
      userId: data.userId,
      name: data.name,
      dosage: data.dosage,
      instructions: data.instructions,
      imageUrl: data.imageUrl,
    },
  });
};

export const getMedications = async (userId: string) => {
  return prisma.medication.findMany({
    where: { userId, isActive: true },
    include: { schedules: true },
    orderBy: { createdAt: "desc" },
  });
};

interface UpdateMedicationInput {
  name?: string;
  dosage?: string;
  instructions?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export const updateMedication = async (
  id: string,
  data: UpdateMedicationInput
) => {
  return prisma.medication.update({
    where: { id },
    data,
  });
};

export const deleteMedication = async (id: string) => {
  return prisma.medication.delete({
    where: { id },
  });
};
