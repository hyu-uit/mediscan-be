import { Response } from "express";
import { AuthRequest } from "../types";
import * as medicationService from "../services/medication.service";
import { sendSuccess, sendError } from "../utils/response";
import {
  HTTP_STATUS,
  FREQUENCY_TYPE_MAP,
  DOSAGE_UNIT_MAP,
  INTERVAL_UNIT_MAP,
  TIME_SLOT_MAP,
} from "../constants";
import { AppError } from "../utils/errors";
import { TimeSlot } from "@prisma/client";

function transformIntakeTimes(
  intakeTimes?: Array<{ id: string; time: string; type: string }>
): Array<{ id: string; time: string; type: TimeSlot }> | undefined {
  if (!intakeTimes) return undefined;
  return intakeTimes?.map((intake) => ({
    id: intake.id,
    time: intake.time,
    type: (TIME_SLOT_MAP[intake.type] ||
      intake?.type?.toUpperCase() ||
      "") as TimeSlot,
  }));
}

export async function createMedication(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const {
      name,
      dosage,
      unit,
      instructions,
      notes,
      frequencyType,
      intervalValue,
      intervalUnit,
      selectedDays,
      intakeTimes,
    } = req.body;

    const medication = await medicationService.createMedication({
      userId,
      name,
      dosage,
      unit: unit ? DOSAGE_UNIT_MAP[unit] : undefined,
      instructions,
      notes,
      frequencyType: frequencyType
        ? FREQUENCY_TYPE_MAP[frequencyType]
        : undefined,
      intervalValue: intervalValue ? parseInt(intervalValue, 10) : undefined,
      intervalUnit: intervalUnit ? INTERVAL_UNIT_MAP[intervalUnit] : undefined,
      selectedDays,
      intakeTimes: transformIntakeTimes(intakeTimes),
    });

    return sendSuccess(res, medication, HTTP_STATUS.CREATED);
  } catch (error) {
    if (error instanceof AppError) {
      return sendError(res, error.message, error.statusCode, req.path);
    }
    console.error("Error creating medication:", error);
    return sendError(
      res,
      "Failed to create medication",
      HTTP_STATUS.INTERNAL_ERROR,
      req.path
    );
  }
}

export async function getMedications(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const result = await medicationService.getMedicationsList(userId);
    return sendSuccess(res, result, HTTP_STATUS.OK);
  } catch (error) {
    if (error instanceof AppError) {
      return sendError(res, error.message, error.statusCode, req.path);
    }
    console.error("Error fetching medications:", error);
    return sendError(
      res,
      "Failed to fetch medications",
      HTTP_STATUS.INTERNAL_ERROR,
      req.path
    );
  }
}

export async function updateMedication(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const {
      name,
      dosage,
      unit,
      instructions,
      notes,
      frequencyType,
      intervalValue,
      intervalUnit,
      selectedDays,
      intakeTimes,
      imageUrl,
      isActive,
    } = req.body;

    const medication = await medicationService.updateMedication(id, {
      name,
      dosage,
      unit: unit ? DOSAGE_UNIT_MAP[unit] : undefined,
      instructions,
      notes,
      frequencyType: frequencyType
        ? FREQUENCY_TYPE_MAP[frequencyType]
        : undefined,
      intervalValue: intervalValue ? parseInt(intervalValue, 10) : undefined,
      intervalUnit: intervalUnit ? INTERVAL_UNIT_MAP[intervalUnit] : undefined,
      selectedDays,
      intakeTimes: transformIntakeTimes(intakeTimes),
      imageUrl,
      isActive,
    });

    return sendSuccess(res, medication, HTTP_STATUS.OK);
  } catch (error) {
    if (error instanceof AppError) {
      return sendError(res, error.message, error.statusCode, req.path);
    }
    console.error("Error updating medication:", error);
    return sendError(
      res,
      "Failed to update medication",
      HTTP_STATUS.INTERNAL_ERROR,
      req.path
    );
  }
}

export async function deleteMedication(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await medicationService.deleteMedication(id);
    return sendSuccess(res, null, HTTP_STATUS.NO_CONTENT);
  } catch (error) {
    if (error instanceof AppError) {
      return sendError(res, error.message, error.statusCode, req.path);
    }
    console.error("Error deleting medication:", error);
    return sendError(
      res,
      "Failed to delete medication",
      HTTP_STATUS.INTERNAL_ERROR,
      req.path
    );
  }
}
