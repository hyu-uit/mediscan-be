import { Response } from "express";
import { AuthRequest } from "../types";
import * as medicationLogService from "../services/medication-log.service";
import { sendSuccess, sendError } from "../utils/response";
import { HTTP_STATUS } from "../constants";
import { AppError } from "../utils/errors";

export async function markTaken(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const log = await medicationLogService.markMedicationTaken(id);
    return sendSuccess(res, log, HTTP_STATUS.OK);
  } catch (error) {
    if (error instanceof AppError) {
      return sendError(res, error.message, error.statusCode, req.path);
    }
    console.error("Error marking medication as taken:", error);
    return sendError(
      res,
      "Failed to mark medication as taken",
      HTTP_STATUS.INTERNAL_ERROR,
      req.path
    );
  }
}

export async function skip(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const log = await medicationLogService.skipMedication(id);
    return sendSuccess(res, log, HTTP_STATUS.OK);
  } catch (error) {
    if (error instanceof AppError) {
      return sendError(res, error.message, error.statusCode, req.path);
    }
    console.error("Error skipping medication:", error);
    return sendError(
      res,
      "Failed to skip medication",
      HTTP_STATUS.INTERNAL_ERROR,
      req.path
    );
  }
}

export async function getLogs(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { date } = req.query;
    const targetDate = date ? new Date(date as string) : undefined;
    const logs = await medicationLogService.getMedicationLogs(
      userId,
      targetDate
    );
    return sendSuccess(res, logs, HTTP_STATUS.OK);
  } catch (error) {
    if (error instanceof AppError) {
      return sendError(res, error.message, error.statusCode, req.path);
    }
    console.error("Error fetching medication logs:", error);
    return sendError(
      res,
      "Failed to fetch medication logs",
      HTTP_STATUS.INTERNAL_ERROR,
      req.path
    );
  }
}

export async function getStats(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { period } = req.query;

    if (!period || !["daily", "weekly", "monthly"].includes(period as string)) {
      return sendError(
        res,
        "period query parameter is required (daily, weekly, or monthly)",
        HTTP_STATUS.BAD_REQUEST,
        req.path
      );
    }

    const stats = await medicationLogService.getIntakeStats(
      userId,
      period as "daily" | "weekly" | "monthly"
    );
    return sendSuccess(res, stats, HTTP_STATUS.OK);
  } catch (error) {
    if (error instanceof AppError) {
      return sendError(res, error.message, error.statusCode, req.path);
    }
    console.error("Error fetching intake stats:", error);
    return sendError(
      res,
      "Failed to fetch intake stats",
      HTTP_STATUS.INTERNAL_ERROR,
      req.path
    );
  }
}

export async function getHistory(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { period } = req.query;

    if (!period || !["daily", "weekly", "monthly"].includes(period as string)) {
      return sendError(
        res,
        "period query parameter is required (daily, weekly, or monthly)",
        HTTP_STATUS.BAD_REQUEST,
        req.path
      );
    }

    const result = await medicationLogService.getLogsForPeriod(
      userId,
      period as "daily" | "weekly" | "monthly"
    );
    return sendSuccess(res, result, HTTP_STATUS.OK);
  } catch (error) {
    if (error instanceof AppError) {
      return sendError(res, error.message, error.statusCode, req.path);
    }
    console.error("Error fetching history:", error);
    return sendError(
      res,
      "Failed to fetch history",
      HTTP_STATUS.INTERNAL_ERROR,
      req.path
    );
  }
}
