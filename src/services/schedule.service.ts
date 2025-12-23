import prisma from "../utils/prisma";
import { TimeSlot } from "@prisma/client";

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

export const createSchedule = async (data: CreateScheduleInput) => {
  return prisma.schedule.create({
    data: {
      medicationId: data.medicationId,
      timeSlot: data.timeSlot,
      customTime: data.customTime,
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
