import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as medicationLogService from "../services/medication-log.service";
import { sendSuccess, sendError } from "../utils/response";

export const markTaken = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const log = await medicationLogService.markMedicationTaken(id);
    return sendSuccess(res, log);
  } catch (error) {
    console.error("Error marking medication as taken:", error);
    if (
      error instanceof Error &&
      error.message === "Medication log not found"
    ) {
      return sendError(res, error.message, 404, req.path);
    }
    return sendError(res, "Failed to mark medication as taken", 500, req.path);
  }
};

export const skip = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const log = await medicationLogService.skipMedication(id);
    return sendSuccess(res, log);
  } catch (error) {
    console.error("Error skipping medication:", error);
    return sendError(res, "Failed to skip medication", 500, req.path);
  }
};

export const getLogs = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { date } = req.query;

    const targetDate = date ? new Date(date as string) : undefined;
    const logs = await medicationLogService.getMedicationLogs(
      userId,
      targetDate
    );
    return sendSuccess(res, logs);
  } catch (error) {
    console.error("Error fetching medication logs:", error);
    return sendError(res, "Failed to fetch medication logs", 500, req.path);
  }
};
