import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as userSettingsService from "../services/user-settings.service";

export const getUserSettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const settings = await userSettingsService.getUserSettings(userId);

    if (!settings) {
      return res.status(404).json({ error: "User settings not found" });
    }

    return res.json(settings);
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return res.status(500).json({ error: "Failed to fetch user settings" });
  }
};

export const createUserSettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const settings = await userSettingsService.createUserSettings(userId);
    return res.status(201).json(settings);
  } catch (error) {
    console.error("Error creating user settings:", error);
    return res.status(500).json({ error: "Failed to create user settings" });
  }
};

export const updateUserSettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const {
      pushNotifications,
      automatedCalls,
      darkMode,
      morningTime,
      noonTime,
      afternoonTime,
      nightTime,
      beforeSleepTime,
    } = req.body;

    const settings = await userSettingsService.updateUserSettings(userId, {
      pushNotifications,
      automatedCalls,
      darkMode,
      morningTime,
      noonTime,
      afternoonTime,
      nightTime,
      beforeSleepTime,
    });

    return res.json(settings);
  } catch (error) {
    console.error("Error updating user settings:", error);
    return res.status(500).json({ error: "Failed to update user settings" });
  }
};

export const upsertUserSettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const {
      pushNotifications,
      automatedCalls,
      darkMode,
      morningTime,
      noonTime,
      afternoonTime,
      nightTime,
      beforeSleepTime,
    } = req.body;

    const settings = await userSettingsService.upsertUserSettings(userId, {
      pushNotifications,
      automatedCalls,
      darkMode,
      morningTime,
      noonTime,
      afternoonTime,
      nightTime,
      beforeSleepTime,
    });

    return res.json(settings);
  } catch (error) {
    console.error("Error upserting user settings:", error);
    return res.status(500).json({ error: "Failed to upsert user settings" });
  }
};

export const deleteUserSettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    await userSettingsService.deleteUserSettings(userId);
    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting user settings:", error);
    return res.status(500).json({ error: "Failed to delete user settings" });
  }
};
