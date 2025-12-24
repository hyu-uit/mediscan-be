import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as scheduleService from "../services/schedule.service";
import { sendSuccess, sendError } from "../utils/response";

/**
 * Create multiple medications with their schedules (bulk operation)
 * POST /api/schedules/bulk
 * Body: { medications: [...] }
 */
export const createBulkMedicationsWithSchedules = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user!.userId;
    const { medications } = req.body;

    if (
      !medications ||
      !Array.isArray(medications) ||
      medications.length === 0
    ) {
      return sendError(res, "medications array is required", 400, req.path);
    }

    const createdMedications =
      await scheduleService.createBulkMedicationsWithSchedules(
        userId,
        medications
      );

    return sendSuccess(res, createdMedications, 201);
  } catch (error) {
    console.error("Error creating bulk medications with schedules:", error);
    return sendError(
      res,
      "Failed to create medications with schedules",
      500,
      req.path
    );
  }
};

export const createSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const { medicationId, time, type } = req.body;

    if (!medicationId || !time || !type) {
      return sendError(
        res,
        "medicationId, time, and type are required",
        400,
        req.path
      );
    }

    const schedule = await scheduleService.createSchedule({
      medicationId,
      time,
      type,
    });

    return sendSuccess(res, schedule, 201);
  } catch (error) {
    console.error("Error creating schedule:", error);
    return sendError(res, "Failed to create schedule", 500, req.path);
  }
};

export const getSchedulesByMedication = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { medicationId } = req.params;

    const schedules = await scheduleService.getSchedulesByMedication(
      medicationId
    );
    return sendSuccess(res, schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return sendError(res, "Failed to fetch schedules", 500, req.path);
  }
};

export const updateSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { time, type, isActive } = req.body;

    const schedule = await scheduleService.updateSchedule(id, {
      time,
      type,
      isActive,
    });

    return sendSuccess(res, schedule);
  } catch (error) {
    console.error("Error updating schedule:", error);
    return sendError(res, "Failed to update schedule", 500, req.path);
  }
};

export const deleteSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await scheduleService.deleteSchedule(id);
    return sendSuccess(res, null, 204);
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return sendError(res, "Failed to delete schedule", 500, req.path);
  }
};
