import prisma from "../utils/prisma";

interface UpdateUserSettingsInput {
  pushNotifications?: boolean;
  automatedCalls?: boolean;
  darkMode?: boolean;
  morningTime?: string;
  noonTime?: string;
  afternoonTime?: string;
  nightTime?: string;
  beforeSleepTime?: string;
}

export const getUserSettings = async (userId: string) => {
  return prisma.userSettings.findUnique({
    where: { userId },
  });
};

export const createUserSettings = async (userId: string) => {
  return prisma.userSettings.create({
    data: { userId },
  });
};

export const updateUserSettings = async (
  userId: string,
  data: UpdateUserSettingsInput
) => {
  return prisma.userSettings.update({
    where: { userId },
    data,
  });
};

export const upsertUserSettings = async (
  userId: string,
  data: UpdateUserSettingsInput
) => {
  return prisma.userSettings.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
};

export const deleteUserSettings = async (userId: string) => {
  return prisma.userSettings.delete({
    where: { userId },
  });
};
