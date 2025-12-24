import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as userSettingsService from "../services/user-settings.service";
import { sendSuccess, sendError } from "../utils/response";

export const getUserSettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const settings = await userSettingsService.getUserSettings(userId);

    if (!settings) {
      return sendError(res, "User settings not found", 404, req.path);
    }

    return sendSuccess(res, settings);
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return sendError(res, "Failed to fetch user settings", 500, req.path);
  }
};

export const createUserSettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const settings = await userSettingsService.createUserSettings(userId);
    return sendSuccess(res, settings, 201);
  } catch (error) {
    console.error("Error creating user settings:", error);
    return sendError(res, "Failed to create user settings", 500, req.path);
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

    return sendSuccess(res, settings);
  } catch (error) {
    console.error("Error updating user settings:", error);
    return sendError(res, "Failed to update user settings", 500, req.path);
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

    return sendSuccess(res, settings);
  } catch (error) {
    console.error("Error upserting user settings:", error);
    return sendError(res, "Failed to upsert user settings", 500, req.path);
  }
};

export const deleteUserSettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    await userSettingsService.deleteUserSettings(userId);
    return sendSuccess(res, null, 204);
  } catch (error) {
    console.error("Error deleting user settings:", error);
    return sendError(res, "Failed to delete user settings", 500, req.path);
  }
};
