import { Response } from "express";
import { AuthRequest } from "../types";
import * as scheduleService from "../services/schedule.service";
import { sendSuccess, sendError } from "../utils/response";
import { HTTP_STATUS } from "../constants";
import { AppError } from "../utils/errors";

export async function createBulkMedicationsWithSchedules(
  req: AuthRequest,
  res: Response
) {
  try {
    const userId = req.user!.userId;
    const { medications } = req.body;

    if (
      !medications ||
      !Array.isArray(medications) ||
      medications.length === 0
    ) {
      return sendError(
        res,
        "medications array is required",
        HTTP_STATUS.BAD_REQUEST,
        req.path
      );
    }

    const createdMedications =
      await scheduleService.createBulkMedicationsWithSchedules(
        userId,
        medications
      );
    return sendSuccess(res, createdMedications, HTTP_STATUS.CREATED);
  } catch (error) {
    if (error instanceof AppError) {
      return sendError(res, error.message, error.statusCode, req.path);
    }
    console.error("Error creating bulk medications:", error);
    return sendError(
      res,
      "Failed to create medications",
      HTTP_STATUS.INTERNAL_ERROR,
      req.path
    );
  }
}

export async function createSchedule(req: AuthRequest, res: Response) {
  try {
    const { medicationId, time, type } = req.body;

    if (!medicationId || !time || !type) {
      return sendError(
        res,
        "medicationId, time, and type are required",
        HTTP_STATUS.BAD_REQUEST,
        req.path
      );
    }

    const schedule = await scheduleService.createSchedule({
      medicationId,
      time,
      type,
    });
    return sendSuccess(res, schedule, HTTP_STATUS.CREATED);
  } catch (error) {
    if (error instanceof AppError) {
      return sendError(res, error.message, error.statusCode, req.path);
    }
    console.error("Error creating schedule:", error);
    return sendError(
      res,
      "Failed to create schedule",
      HTTP_STATUS.INTERNAL_ERROR,
      req.path
    );
  }
}

export async function getSchedulesByMedication(
  req: AuthRequest,
  res: Response
) {
  try {
    const { medicationId } = req.params;
    const schedules = await scheduleService.getSchedulesByMedication(
      medicationId
    );
    return sendSuccess(res, schedules, HTTP_STATUS.OK);
  } catch (error) {
    if (error instanceof AppError) {
      return sendError(res, error.message, error.statusCode, req.path);
    }
    console.error("Error fetching schedules:", error);
    return sendError(
      res,
      "Failed to fetch schedules",
      HTTP_STATUS.INTERNAL_ERROR,
      req.path
    );
  }
}

export async function updateSchedule(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { time, type, isActive } = req.body;
    const schedule = await scheduleService.updateSchedule(id, {
      time,
      type,
      isActive,
    });
    return sendSuccess(res, schedule, HTTP_STATUS.OK);
  } catch (error) {
    if (error instanceof AppError) {
      return sendError(res, error.message, error.statusCode, req.path);
    }
    console.error("Error updating schedule:", error);
    return sendError(
      res,
      "Failed to update schedule",
      HTTP_STATUS.INTERNAL_ERROR,
      req.path
    );
  }
}

export async function deleteSchedule(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await scheduleService.deleteSchedule(id);
    return sendSuccess(res, null, HTTP_STATUS.NO_CONTENT);
  } catch (error) {
    if (error instanceof AppError) {
      return sendError(res, error.message, error.statusCode, req.path);
    }
    console.error("Error deleting schedule:", error);
    return sendError(
      res,
      "Failed to delete schedule",
      HTTP_STATUS.INTERNAL_ERROR,
      req.path
    );
  }
}
