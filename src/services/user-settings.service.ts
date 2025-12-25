import prisma from "../utils/prisma";
import { UpdateUserSettingsInput } from "../types";
import { BadRequestError, NotFoundError } from "../utils/errors";

export async function getUserSettings(userId: string) {
  if (!userId) throw new BadRequestError("userId is required");

  return prisma.userSettings.findUnique({ where: { userId } });
}

export async function createUserSettings(userId: string) {
  if (!userId) throw new BadRequestError("userId is required");

  return prisma.userSettings.create({ data: { userId } });
}

export async function updateUserSettings(
  userId: string,
  data: UpdateUserSettingsInput
) {
  if (!userId) throw new BadRequestError("userId is required");

  const existing = await prisma.userSettings.findUnique({ where: { userId } });
  if (!existing) throw new NotFoundError("User settings");

  return prisma.userSettings.update({ where: { userId }, data });
}

export async function upsertUserSettings(
  userId: string,
  data: UpdateUserSettingsInput
) {
  if (!userId) throw new BadRequestError("userId is required");

  return prisma.userSettings.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}

export async function deleteUserSettings(userId: string) {
  if (!userId) throw new BadRequestError("userId is required");

  return prisma.userSettings.delete({ where: { userId } });
}

export async function togglePushNotifications(userId: string) {
  if (!userId) throw new BadRequestError("userId is required");

  const settings = await prisma.userSettings.findUnique({ where: { userId } });

  if (!settings) {
    // Create with push notifications enabled (toggled from default true to false doesn't make sense for first toggle)
    return prisma.userSettings.create({
      data: { userId, pushNotifications: false },
    });
  }

  return prisma.userSettings.update({
    where: { userId },
    data: { pushNotifications: !settings.pushNotifications },
  });
}

export async function toggleAutomatedCalls(userId: string) {
  if (!userId) throw new BadRequestError("userId is required");

  const settings = await prisma.userSettings.findUnique({ where: { userId } });

  if (!settings) {
    return prisma.userSettings.create({
      data: { userId, automatedCalls: true },
    });
  }

  return prisma.userSettings.update({
    where: { userId },
    data: { automatedCalls: !settings.automatedCalls },
  });
}

export async function toggleDarkMode(userId: string) {
  if (!userId) throw new BadRequestError("userId is required");

  const settings = await prisma.userSettings.findUnique({ where: { userId } });

  if (!settings) {
    return prisma.userSettings.create({
      data: { userId, darkMode: true },
    });
  }

  return prisma.userSettings.update({
    where: { userId },
    data: { darkMode: !settings.darkMode },
  });
}
