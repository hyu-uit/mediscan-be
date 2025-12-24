import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as scheduleService from "../services/schedule.service";
import { sendSuccess, sendError } from "../utils/response";

export const createSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const { medicationId, timeSlot, customTime } = req.body;

    if (!medicationId || !timeSlot) {
      return sendError(
        res,
        "medicationId and timeSlot are required",
        400,
        req.path
      );
    }

    const schedule = await scheduleService.createSchedule({
      medicationId,
      timeSlot,
      customTime,
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
    const { timeSlot, customTime, isActive } = req.body;

    const schedule = await scheduleService.updateSchedule(id, {
      timeSlot,
      customTime,
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
