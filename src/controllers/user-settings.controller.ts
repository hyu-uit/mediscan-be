import { Response } from "express";
import { AuthRequest } from "../types";
import * as userSettingsService from "../services/user-settings.service";
import { sendSuccess, sendError } from "../utils/response";
import { HTTP_STATUS } from "../constants";
import { AppError } from "../utils/errors";

export async function getUserSettings(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const settings = await userSettingsService.getUserSettings(userId);

    if (!settings) {
      return sendError(res, "User settings not found", HTTP_STATUS.NOT_FOUND, req.path);
    }

    return sendSuccess(res, settings, HTTP_STATUS.OK);
  } catch (error) {
    if (error instanceof AppError) {
      return sendError(res, error.message, error.statusCode, req.path);
    }
    console.error("Error fetching user settings:", error);
    return sendError(res, "Failed to fetch user settings", HTTP_STATUS.INTERNAL_ERROR, req.path);
  }
}

export async function createUserSettings(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const settings = await userSettingsService.createUserSettings(userId);
    return sendSuccess(res, settings, HTTP_STATUS.CREATED);
  } catch (error) {
    if (error instanceof AppError) {
      return sendError(res, error.message, error.statusCode, req.path);
    }
    console.error("Error creating user settings:", error);
    return sendError(res, "Failed to create user settings", HTTP_STATUS.INTERNAL_ERROR, req.path);
  }
}

export async function updateUserSettings(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { pushNotifications, automatedCalls, darkMode, morningTime, noonTime, afternoonTime, nightTime, beforeSleepTime } = req.body;

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

    return sendSuccess(res, settings, HTTP_STATUS.OK);
  } catch (error) {
    if (error instanceof AppError) {
      return sendError(res, error.message, error.statusCode, req.path);
    }
    console.error("Error updating user settings:", error);
    return sendError(res, "Failed to update user settings", HTTP_STATUS.INTERNAL_ERROR, req.path);
  }
}

export async function upsertUserSettings(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { pushNotifications, automatedCalls, darkMode, morningTime, noonTime, afternoonTime, nightTime, beforeSleepTime } = req.body;

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

    return sendSuccess(res, settings, HTTP_STATUS.OK);
  } catch (error) {
    if (error instanceof AppError) {
      return sendError(res, error.message, error.statusCode, req.path);
    }
    console.error("Error upserting user settings:", error);
    return sendError(res, "Failed to upsert user settings", HTTP_STATUS.INTERNAL_ERROR, req.path);
  }
}

export async function deleteUserSettings(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    await userSettingsService.deleteUserSettings(userId);
    return sendSuccess(res, null, HTTP_STATUS.NO_CONTENT);
  } catch (error) {
    if (error instanceof AppError) {
      return sendError(res, error.message, error.statusCode, req.path);
    }
    console.error("Error deleting user settings:", error);
    return sendError(res, "Failed to delete user settings", HTTP_STATUS.INTERNAL_ERROR, req.path);
  }
}
